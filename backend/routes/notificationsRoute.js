import express from "express";
import {
  createNotification,
  getAllNotifications,
  makeAllNotificationRead,
  updateNotification,
} from "../controllers/notificationsController.js";

import { protect } from "../controllers/authController.js";

const router = express.Router();

router.post("/createNotification/:id", protect, createNotification);
router.get("/getAllNotifications", protect, getAllNotifications);
router.patch("/updateNotification/:id", protect, updateNotification);
router.patch("/makeAllNotificationRead", protect, makeAllNotificationRead);

export default router;
