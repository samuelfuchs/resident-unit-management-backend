import { Request, Response } from "express";
import Bill from "../models/Bill";
import { StatusCodes } from "http-status-codes";

export const createBill = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { residentId, amount, description, dueDate } = req.body;
    console.log(req.body);

    const bill = new Bill({
      resident: residentId,
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
      resident: req.user.id,
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

    const bills = await Bill.find({ resident: residentId })
      .sort({ dueDate: -1 })
      .populate("resident", "name email");

    res.status(200).json(bills);
  } catch (error) {
    console.error("Get resident bills error:", error);
    res.status(500).json({ error: "Failed to fetch resident bills" });
  }
};

export const getBillPaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      resident: req.user.id,
    });

    if (!bill) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Bill not found",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        status: bill.status,
        paymentDetails: bill.paymentDetails,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error fetching bill payment status",
    });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const bills = await Bill.find({
      resident: req.user.id,
      status: { $in: ["paid", "failed"] },
    })
      .sort({ paidAt: -1 })
      .select("amount description status paymentDetails paidAt dueDate");

    res.status(StatusCodes.OK).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error fetching payment history",
    });
  }
};

export const getAllBills = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    const query: any = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { description: new RegExp(search as string, "i") },
        { "resident.name": new RegExp(search as string, "i") },
      ];
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const bills = await Bill.find(query)
      .populate("resident", "name email unitNumber")
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const totalBills = await Bill.countDocuments(query);

    res.status(200).json({
      bills,
      totalBills,
      totalPages: Math.ceil(totalBills / limitNumber),
      currentPage: pageNumber,
      hasMore: pageNumber * limitNumber < totalBills,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};
