import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
} from "src/controllers/userController";
import { authMiddleware } from "src/middlewares/authMiddleware";
import { roleValidationMiddleware } from "src/middlewares/roleValidationMiddleware";

const router = Router();

router.get("/", authMiddleware, getUsers);
router.post("/", authMiddleware, roleValidationMiddleware, createUser);
router.put("/:id", authMiddleware, roleValidationMiddleware, updateUser);

export default router;