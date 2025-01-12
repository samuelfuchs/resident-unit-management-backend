import { Request, Response } from "express";
import User from "../models/User";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, lastName, role, phone, address, zipCode, city, state, unitNumber, status } = req.body;

    const newUser = new User({
      email,
      name,
      lastName,
      role,
      phone,
      address,
      zipCode,
      city,
      state,
      unitNumber,
      status,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
};