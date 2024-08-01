import { Request, Response } from "express";
import User from "../models/user";

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return res.status(200).json(existingUser); // if user exists, return user
    }
    const newUser = new User(req.body); // else create a new user
    await newUser.save();
    res.status(201).json(newUser.toObject());
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error creating user" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  const { name, address, zipcode, city } = req.body;
  const userId = req.userId;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, address, zipcode, city },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser.toObject());
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error updating user" });
  }
};

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(currentUser.toObject());
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error getting user" });
  }
};

export default { createCurrentUser, updateCurrentUser, getCurrentUser };
