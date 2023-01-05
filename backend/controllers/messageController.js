import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Message from "../models/messageModel.js";

export const createMessage = catchAsync(async (req, res, next) => {
  const { chatId, senderId, text } = req.body;
  const message = await Message.create({
    chatId,
    senderId,
    text,
  });
  if (!message) {
    return next(
      new AppError(
        "There was an error while trying to create a new message",
        400
      )
    );
  }
  res.status(201).json(message);
});

export const getMessages = catchAsync(async (req, res, next) => {
  const { id: chatId } = req.params;
  const messages = await Message.find({ chatId });
  if (!messages) {
    return next(new AppError("There are no messages for this chat", 404));
  }
  res.status(200).json(messages);
});
