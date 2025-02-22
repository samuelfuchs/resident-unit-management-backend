import express from "express";
import {
  createBill,
  getResidentBills,
  updateBillStatus,
  getBillsByResidentId,
  getBillPaymentStatus,
  getPaymentHistory,
  getAllBills,
} from "../controllers/billController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnlyMiddleware } from "../middlewares/adminOnlyMiddleware";

const router = express.Router();

router.post("/", authMiddleware, adminOnlyMiddleware, createBill);
router.get("/my-bills", authMiddleware, getResidentBills);
router.patch(
  "/:billId/status",
  authMiddleware,
  adminOnlyMiddleware,
  updateBillStatus
);
router.get(
  "/resident/:residentId",
  authMiddleware,
  adminOnlyMiddleware,
  getBillsByResidentId
);
router.get("/:id/payment-status", authMiddleware, getBillPaymentStatus);
router.get("/payment-history", authMiddleware, getPaymentHistory);
router.get("/", authMiddleware, adminOnlyMiddleware, getAllBills);

export default router;
