import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Post from "../models/postModel.js";
import DeletedAccounts from "../models/deletedAccountsModel.js";
import Comment from "../models/commentModel.js";
import jwt from "jsonwebtoken";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
  );
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});


export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
  );
  if (!users) {
    return next(new AppError("No users found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: users,
  });
});

export const getUsersFilter = catchAsync(async (req, res, next) => {
  const { filter } = req.query;
  const users = await User.find({
    $or: [
      { name: { $regex: filter, $options: "i" } },
      { email: { $regex: filter, $options: "i" } },
    ],
  }).select(
    "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
  );
  if (!users) {
    return next(new AppError("No users found with that ID", 404));
  }
  res.status(200).json(users);
});

export const updateUserInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!req.body.password || req.body.password.length === 0) {
    return next(new AppError("Password is required", 401));
  }
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError("Incorrect password", 401));
  }
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.about = req.body.about || user.about;
  user.living = req.body.living || user.living;
  user.about = req.body.about || user.about;
  user.relationship = req.body.relationship || user.relationship;
  user.status = req.body.status || user.status;
  user.working = req.body.working || user.working;
  user.relationship = req.body.relationship || user.relationship;
  await user.save();

  user.password = undefined;

  createSendToken(user, 200, req, res);
});

export const updateUserPictures = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.profilePicture = req.body.profilePicture || user.profilePicture;
  user.coverPicture = req.body.coverPicture || user.coverPicture;

  await user.save();

  createSendToken(user, 200, req, res);
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const followUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  const userToFollow = await User.findById(req.params.id);
  if (!userToFollow) {
    return next(new AppError("No userToFollow found with that ID", 404));
  }

  if (user.following.includes(req.params.id)) {
    return next(new AppError("You already follow this user", 400));
  }

  const updatedDoc = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        following: req.params.id,
      },
    },
    { new: true }
  );

  await userToFollow.updateOne({
    $push: {
      followers: req.user._id,
    },
  });

  createSendToken(updatedDoc, 200, req, res);
});

export const unfollowUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  const userToUnfollow = await User.findById(req.params.id);
  if (!userToUnfollow) {
    return next(new AppError("No userToUnfollow found with that ID", 404));
  }

  if (!user.following.includes(req.params.id)) {
    return next(new AppError("You don't follow this user", 400));
  }

  const updatedDoc = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        following: req.params.id,
      },
    },
    { new: true }
  );

  await userToUnfollow.updateOne({
    $pull: {
      followers: req.user._id,
    },
  });

  createSendToken(updatedDoc, 200, req, res);
});

export const updateUserToActive = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!password || password.length === 0) {
    return next(new AppError("Password is required", 401));
  }
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }

  if (!user) {
    return next(new AppError("No user found with this id", 401));
  }
  user.active = true;
  await user.save();

  createSendToken(user, 200, req, res);
});

export const updateUserToUnActive = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("No user found with this id", 401));
  }
  user.active = false;
  await user.save();

  res.status(200).json({
    status: "success",
  });
});

export const deleteAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("No user found with this id", 401));
  }

  await user.remove();

  await DeletedAccounts.create({
    userId: req.user._id,
    email: req.user.email,
    name: req.user.name,
    deletedAt: new Date(),
  });
  await Post.find({ userId: req.user._id }).deleteMany();
  await Comment.find({ userId: req.user._id }).deleteMany();
  await Chat.find({ $in: [req.user._id] }).deleteMany();

  res.status(200).json({
    status: "you have successfully deleted your account",
  });
});

export const getAllDeletedAccounts = catchAsync(async (req, res, next) => {
  const deletedAccounts = await DeletedAccounts.find({});

  if (!deletedAccounts) {
    return next(new AppError("No deleted accounts found", 404));
  }

  res.status(200).json(deletedAccounts);
});

export const updateUserNotifications = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with this id", 404));
  }
  user.notifications.push(req.body.notification);
  await user.save();

  createSendToken(user, 200, req, res);
});
