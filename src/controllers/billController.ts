import { Request, Response } from "express";
import Bill from "../models/Bill";

export const createBill = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { residentId, amount, description, dueDate } = req.body;

    const bill = new Bill({
      residentId,
      amount,
      description,
      dueDate,
      createdBy: req.user.id,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    console.error("Bill creation error:", error);
    res.status(500).json({ error: "Failed to create bill" });
  }
};

export const getResidentBills = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bills = await Bill.find({
      residentId: req.user.id,
    }).sort({ dueDate: -1 });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

export const updateBillStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { billId } = req.params;
    const { status, paymentIntentId } = req.body;

    const bill = await Bill.findByIdAndUpdate(
      billId,
      {
        status,
        paymentIntentId,
        ...(status === "paid" && { paidAt: new Date() }),
      },
      { new: true }
    );

    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    res.status(200).json(bill);
  } catch (error) {
    console.error("Bill update error:", error);
    res.status(500).json({ error: "Failed to update bill" });
  }
};

export const getBillsByResidentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { residentId } = req.params;

    const bills = await Bill.find({ residentId })
      .sort({ dueDate: -1 })
      .populate("residentId", "name email"); 

    res.status(200).json(bills);
  } catch (error) {
    console.error("Get resident bills error:", error);
    res.status(500).json({ error: "Failed to fetch resident bills" });
  }
};
