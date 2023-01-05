import express from "express";
import {
  createMessage,
  getMessages,
} from "../controllers/messageController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.post("/createMessage", protect, createMessage);
router.get("/:id", protect, getMessages);

export default router;
