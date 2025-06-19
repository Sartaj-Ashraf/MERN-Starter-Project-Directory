import { Router } from "express";
const router = Router();

import {
  login,
  logout,
  register,
  verifyEmail,
} from "../controllers/authController.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../middleware/validationMiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/verify-email", verifyEmail);
router.post("/login", validateLoginInput, login);
router.get("/logout", logout);

export default router;
