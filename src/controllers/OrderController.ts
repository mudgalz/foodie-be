import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY!);
const FRONTEND_URL = process.env.FRONTEND_URL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
    zipcode: string;
  };
  restaurantId: string;
};

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const orders = await Order.find({
      user: req.userId,
      status: { $ne: "placed" },
    })
      .populate("restaurant") // This will load the restaurant document that is referenced in the order document, and include it in the returned order document
      .populate("user") // This will load the user document that is referenced in the order document, and include it in the returned order document
      .limit(pageSize)
      .skip(skip);

    const total = await Order.countDocuments({
      user: req.userId,
      status: { $ne: "placed" },
    });
    const response = {
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"] as string;
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (err: any) {
    console.log(err);
    return res.status(400).json({ message: "Webhook error:" + err?.message });
  }

  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";
    await order.save();
  }

  res.status(200).json({ received: true });
};
const createCheckoutSeesion = async (req: Request, res: Response) => {
  try {
    const sessionReq: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(sessionReq.restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: sessionReq.deliveryDetails,
      cartItems: sessionReq.cartItems,
      createdAt: new Date(),
    });
    const lineItems = createLineItems(sessionReq, restaurant.menuItems);
    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice * 100,
      restaurant._id.toString()
    );
    if (!session.url)
      return res.status(500).json({ message: "Error creating stripe session" });
    await newOrder.save();
    res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.log(e);
    res
      .status(500)
      .json({ message: e?.raw?.message ?? "Internal server error" });
  }
};

const createLineItems = (
  sessionReq: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  const lineItems = sessionReq.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (menuItem) => menuItem._id.toString() === cartItem.menuItemId.toString()
    );
    if (!menuItem) {
      throw new Error("Menu item not found:" + cartItem.menuItemId);
    }
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "INR",
        unit_amount: menuItem.price * 100, // amount should be smallest currency unit
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: cartItem.quantity,
    };

    return lineItem;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const session = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Standard Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "INR",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return session;
};

export default { createCheckoutSeesion, stripeWebhookHandler, getMyOrders };
