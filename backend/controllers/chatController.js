import Chat from "../models/chatModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const createChat = catchAsync(async (req, res, next) => {
  const { senderId, receiverId } = req.body;

  const existChat = await Chat.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (existChat) {
    return next(new AppError("Chat already exist", 400));
  }

  const chat = await Chat.create({
    members: [senderId, receiverId],
  });

  if (!chat) {
    return next(
      new AppError("There was an error trying to create a new chat", 400)
    );
  }
  res.status(201).json(chat);
});

export const userChats = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const chats = await Chat.find({ members: { $in: [id] } });
  if (!chats) {
    return next(new AppError("There are no chats for this user", 404));
  }
  res.status(200).json(chats);
});

export const findChat = catchAsync(async (req, res, next) => {
  const { firstUserId, secondUserId } = req.params;
  const chat = await Chat.findOne({
    members: { $all: [firstUserId, secondUserId] },
  });
  if (!chat) {
    return next(new AppError("There is no chat between these users", 404));
  }
  res.status(200).json(chat);
});
