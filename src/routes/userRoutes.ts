import { Router } from "express";
import {
  createUser,
  deleteUser,
  getMe,
  getUsers,
  updateUser,
} from "src/controllers/userController";
import { adminOnlyMiddleware } from "src/middlewares/adminOnlyMiddleware";
import { authMiddleware } from "src/middlewares/authMiddleware";
import { roleValidationMiddleware } from "src/middlewares/roleValidationMiddleware";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, getUsers);
router.post("/", authMiddleware, roleValidationMiddleware, createUser);
router.put("/:id", authMiddleware, roleValidationMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteUser);

export default router;