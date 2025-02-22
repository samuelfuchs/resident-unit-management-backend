import { Request, Response } from "express";
import User from "../models/User";
import Bill from "../models/Bill";

const validSortFields = ["name", "email", "createdAt", "role", "status"];

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user information" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      role,
      status,
      page = 1,
      limit = 10,
      sortField,
      sortOrder,
    } = req.query;

    const query: any = {};

    if (search) {
      const normalizedSearch = (search as string)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const regex = new RegExp(normalizedSearch, "i");
      query.$or = [
        { name: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { address: regex },
        { city: regex },
        { state: regex },
        { unitNumber: regex },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const sort: any = {};
    if (sortField && validSortFields.includes(sortField as string)) {
      sort[sortField as string] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort["createdAt"] = -1;
    }

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNumber),
      currentPage: pageNumber,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
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
    } = req.body;

    const newUser = new User({
      email,
      password,
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

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user by ID" });
  }
};

export const getAdminDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResidents = await User.countDocuments({ role: "resident" });

    const totalBills = await Bill.countDocuments();
    const unpaidBills = await Bill.countDocuments({ status: "pending" });
    const paidBills = await Bill.countDocuments({ status: "paid" });

    const unpaidBillsAmount = await Bill.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const paidBillsAmount = await Bill.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const pendingAmount = unpaidBillsAmount[0]?.total || 0;
    const revenue = paidBillsAmount[0]?.total || 0;

    res.status(200).json({
      totalUsers,
      totalResidents,
      bills: {
        total: totalBills,
        paid: paidBills,
        unpaid: unpaidBills,
        pendingAmount,
        revenue,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" });
  }
};