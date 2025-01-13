import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User, { IUser } from "../models/User";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, lastName, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = new User({
      email,
      password: hashedPassword,
      name,
      lastName,
      role,
      phone,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    //@TODO implement bcrypt!!
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password;
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const userObject = user.toObject() as { password?: string };
    delete userObject.password;

    res.status(200).json({ token, user: userObject });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    //@TODO replace with email service later
    res.status(200).json({
      message: "Password reset token generated.",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating reset token", error });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
    };

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({ message: "Invalid token or user not found" });
      return;
    }

    //@TODO hash password with bcrypt!!
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token", error });
  }
};