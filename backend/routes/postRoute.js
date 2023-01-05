import express from "express";
import app from "../app.js";
import { protect } from "../controllers/authController.js";
import {
  createPost,
  deletePost,
  getCommentFromPost,
  getPost,
  getTimeLine,
  likePost,
  updatePost,
  addComment,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/getTimeLine", protect, getTimeLine);
router.get("/getCommentFromPost/:id", protect, getCommentFromPost);
router.get("/getPost/:id", protect, getPost);
router.post("/createPost", protect, createPost);
router.post("/addComment/:id", protect, addComment);
router.patch("/updatePost/:id", protect, updatePost);
router.patch("/likePost/:id", protect, likePost);
router.delete("/deletePost/:id", protect, deletePost);

export default router;
