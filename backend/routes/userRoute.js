import express from "express";
import {
  deleteAccount,
  deleteUser,
  followUser,
  getAllDeletedAccounts,
  getAllUsers,
  getUser,
  getUsersFilter,
  unfollowUser,
  updateUserInfo,
  updateUserNotifications,
  updateUserPictures,
  updateUserToActive,
  updateUserToUnActive,
} from "../controllers/userController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.get("/getOneUser/:id", protect, getUser);
router.get("/getAllUsers", protect, getAllUsers);
router.get("/getAllDeletedAccounts", protect, getAllDeletedAccounts);
router.get("/getUsersFilter", protect, getUsersFilter);
router.patch("/updateUserInfo", protect, updateUserInfo);
router.delete("/deleteUser/:id", protect, deleteUser);
router.patch("/follow/:id", protect, followUser);
router.patch("/unFollow/:id", protect, unfollowUser);
router.patch("/updateUserPictures", protect, updateUserPictures);
router.patch("/updateUserNotifications/id", protect, updateUserNotifications);
router.post("/updateUserToActive", updateUserToActive);
router.patch("/updateUserToUnActive", protect, updateUserToUnActive);
router.delete("/deleteAccount", protect, deleteAccount);

export default router;
