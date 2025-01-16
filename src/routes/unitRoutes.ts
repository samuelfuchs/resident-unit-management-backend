import { Router } from "express";
import {
  createUnit,
  getUnits,
  getUnitById,
  deleteUnit,
  updateUnit,
} from "../controllers/unitController";
import { adminOnlyMiddleware } from "src/middlewares/adminOnlyMiddleware";
import { authMiddleware } from "src/middlewares/authMiddleware";

const router = Router();

router.post("/units", authMiddleware, adminOnlyMiddleware, createUnit);
router.get("/units", authMiddleware, getUnits);
router.get("/units/:id", authMiddleware, getUnitById);
router.delete("/units/:id", authMiddleware, adminOnlyMiddleware, deleteUnit);
router.put("/units/:id", authMiddleware, adminOnlyMiddleware, updateUnit);

export default router;
