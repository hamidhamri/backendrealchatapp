import Post from "../models/postModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import Comment from "../models/commentModel.js";
import mongoose from "mongoose";

export const createPost = catchAsync(async (req, res, next) => {
  if (
    !req.body.description ||
    req.body.description.length === 0 ||
    !req.body.image
  ) {
    return next(new AppError("description and image are required", 400));
  }
  const post = await Post.create({
    userId: req.user._id,
    userIdToPopulate: req.user._id,
    description: req.body.description,
    image: req.body.image,
    dimensions: req.body.dimensions,
  });
  res.status(201).json({
    status: "success",
    data: post,
  });
});

export const getCommentFromPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "userIdToPopulate",
    "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
  );

  const postWithComments = post.comments.map(async (comment) => {
    return await Comment.findById(comment._id).populate("userId");
  });

  if (!post) {
    return next(new AppError("No post found with this id", 404));
  }
  res.status(200).json({
    status: "success",
    data: await Promise.all(postWithComments),
  });
});

export const getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "userIdToPopulate",
    "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
  );

  if (!post) {
    return next(new AppError("No post found with this id", 404));
  }
  res.status(200).json({
    status: "success",
    data: post,
  });
});

export const updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || JSON.stringify(post.userId) !== JSON.stringify(req.user._id)) {
    return next(
      new AppError(
        "No post found with that ID OR You are not allowed to update this post",
        404
      )
    );
  }
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedPost,
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || JSON.stringify(post.userId) !== JSON.stringify(req.user._id)) {
    return next(
      new AppError(
        "No post found with that ID OR You are not allowed to delete this post",
        404
      )
    );
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success" });
});

export const likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("No post found with this id", 404));
  }
  if (post.likes.includes(req.user._id)) {
    await post.updateOne(
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );
  } else {
    await post.updateOne(
      {
        $push: { likes: req.user._id },
      },
      { new: true }
    );
  }

  res.status(200).json({
    status: "success",
    data: post,
  });
});

export const getTimeLine = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10000;
  const skip = (page - 1) * limit;

  const currentUserPosts = await Post.find({ userId: req.user._id })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit)
    .populate(
      "userIdToPopulate",
      "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
    );
  const followingUserPosts = await User.aggregate([
    { $match: { _id: req.user._id } },
    {
      $lookup: {
        from: "posts",
        localField: "following",
        foreignField: "userId",
        as: "followingPosts",
      },
    },
    { $unwind: "$followingPosts" },
    { $sort: { "followingPosts.createdAt": -1 } },
    { $skip: skip || 0 },
    { $limit: limit || 6 },

    {
      $project: {
        _id: 0,
        followingPosts: 1,
      },
    },
  ]);

  // populate the userIdToPopulate field of the posts
  const followingUserPostsPopulated = followingUserPosts.map(async (post) => {
    return await Post.findById(post.followingPosts._id).populate(
      "userIdToPopulate",
      "-password -__v -createdAt -updatedAt -email -isAdmin -active -deleted"
    );
  });

  const allPostss = await Promise.all(followingUserPostsPopulated);

  const allPosts = [...currentUserPosts, ...allPostss];
  res.status(200).json({
    data: allPosts,
  });
});

/////////////////
// COMMENTS ////
///////////////

export const addComment = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const { commentId } = req.body;
  if (!post) {
    return next(new AppError("No post found with this id", 404));
  }
  if (!commentId) {
    return next(new AppError("commentIdare required", 400));
  }
  await post.updateOne({
    $push: { comments: commentId },
  });
  res.status(201).json({
    status: "comment added successfully",
  });
});
