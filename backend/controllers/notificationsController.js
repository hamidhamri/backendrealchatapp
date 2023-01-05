import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import Notifications from "../models/notificationsModel.js";

export const createNotification = catchAsync(async (req, res, next) => {
  if (req.body.like) {
    const existNotification = await Notifications.findOne({
      userId: req.params.id,
      senderId: req.user._id,
      postId: req.body.postId,
      type: "likePost",
    });

    if (existNotification) {
      return;
    }
  }

  if (req.params.id === req.user._id.toString()) {
    return;
  }

  const newNotification = await Notifications.create({
    userId: req.params.id,
    senderId: req.user._id,
    text: req.body.text,
    type: req.body.type,
    postId: req.body.postId,
  });
  if (!newNotification) {
    return next(new AppError("Could not create notification", 500));
  }

  res.status(201).json(newNotification);
});

export const getAllNotifications = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notifications.find({
    userId: req.user._id,
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("senderId", "name profilePicture");

  if (!notifications) {
    return next(new AppError("No notifications found", 404));
  }

  res.status(200).json(notifications);
});

export const updateNotification = catchAsync(async (req, res, next) => {
  const notification = await Notifications.findByIdAndUpdate(
    req.params.id,
    {
      read: true,
    },
    { new: true }
  );
  if (!notification) {
    return next(new AppError("No notification found", 404));
  }

  res.status(200).json(notification);
});

export const makeAllNotificationRead = catchAsync(async (req, res, next) => {
  const notifications = await Notifications.updateMany(
    { userId: req.user._id },
    { read: true }
  );
  if (!notifications) {
    return next(new AppError("No notifications found", 404));
  }

  res.status(200).json(notifications);
});
