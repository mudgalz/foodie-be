import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string."),
  body("address")
    .isString()
    .notEmpty()
    .withMessage("Address must be a string."),
  body("zipcode")
    .isString()
    .notEmpty()
    .withMessage("Zipcode must be a string."),
  body("city").isString().notEmpty().withMessage("City must be a string."),
  handleValidationErrors,
];

export const validateRestaurantRequest = [
  body("restaurantName").notEmpty().withMessage("Restaurant name is required"),
  body("zipcode").notEmpty().withMessage("Zipcode is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery price must be a positive number"),
  body("estimatedDeliveryTime")
    .isInt({ min: 0 })
    .withMessage("Estimated delivery time must be a positive integer"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines array cannot be empty"),
  body("menuItems").isArray().withMessage("Menu items must be an array"),
  body("menuItems.*.name").notEmpty().withMessage("Menu item name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Menu item price must be a positive number"),
  handleValidationErrors,
];
