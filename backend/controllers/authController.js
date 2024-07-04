import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const signToken = (id) => {
  console.log("JWT SECRET",process.env.JWT_SECRET)
  console.log("JWT EXPIRES IN",process.env.JWT_EXPIRES_IN)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  console.log(token)
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

export const register = catchAsync(async (req, res, next) => {
  const existUser = await User.findOne({ email: req.body.email });
  console.log(existUser)
  if (existUser) {
    return next(new AppError("Email already exists", 400));
  }
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  console.log('user', user)

  createSendToken(user, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (user.active === false) {
    return next(new AppError("Your account is not active", 401));
  }

  if (user.deleted === true) {
    return next(new AppError("Your account has been deleted permanently", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError("The user belonging to this token does no longer exist", 401)
      );
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password! Please log in again", 401)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Your token has expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

export const geUserCredentials = catchAsync(async (req, res, next) => {
  console.log("haha")
  const user = await User.findById(req.user.id);
  console.log(user)
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json(user);
});
