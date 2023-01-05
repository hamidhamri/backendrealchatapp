import mongoose from "mongoose";

const deletedAccountsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

const DeletedAccounts = mongoose.model(
  "DeletedAccounts",
  deletedAccountsSchema
);

export default DeletedAccounts;
