import express from "express";
import { createComment } from "../controllers/commentController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.post("/createComment/:id", protect, createComment);

export default router;
