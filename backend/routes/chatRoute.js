import express from "express";
import {
  createChat,
  findChat,
  userChats,
} from "../controllers/chatController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.post("/createChat", protect, createChat);
router.get("/:id", protect, userChats);
router.get("/find/:firstUserId/:secondUserId", protect, findChat);

export default router;
