import { Router } from "express";
import {
  createBill,
  getResidentBills,
  updateBillStatus,
  getBillsByResidentId,
} from "../controllers/billController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnlyMiddleware } from "../middlewares/adminOnlyMiddleware";

const router = Router();

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

export default router;
