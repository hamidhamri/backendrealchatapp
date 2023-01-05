import express from "express";
import {
  register,
  login,
  protect,
  updatePassword,
  geUserCredentials,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/getUserCredentials", protect, geUserCredentials);
router.post("/register", register);
router.post("/login", login);
router.patch("/updatepassword", protect, updatePassword);

export default router;
