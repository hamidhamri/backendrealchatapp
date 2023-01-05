import Comment from "../models/commentModel.js";
import catchAsync from "../utils/catchAsync.js";

export const createComment = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { description } = req.body;

  const comment = await Comment.create({
    userId: req.user._id,
    description,
    postId: id,
  });
  res.status(201).json(comment._id);
});
