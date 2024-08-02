import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
const createRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({
      user: req.userId,
    });
    if (existingRestaurant) {
      return res.status(409).json({ message: "User already has a restaurant" });
    }
    const imageUrl = await uploadImage(req.file as Express.Multer.File);
    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "User has no restaurant" });
    }
    res.status(200).json(restaurant);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error getting restaurant" });
  }
};

const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });
    if (!restaurant)
      return res.status(404).json({ message: "User has no restaurant" });

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.zipcode = req.body.zipcode;
    restaurant.city = req.body.city;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();
    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.uploader.upload(dataURI, {
    transformation: [
      { width: 1000, crop: "scale" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });
  return uploadResponse.url;
};
export default { getRestaurant, createRestaurant, updateRestaurant };
