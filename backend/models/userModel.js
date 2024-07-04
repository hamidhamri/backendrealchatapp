import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    passwordChangedAt: Date,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dnnaq2dbk/image/upload/v1720102860/biehu3hxdtiinwfcpudu.jpg",
    },
    coverPicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dnnaq2dbk/image/upload/v1720102995/khgcfmnywawysz94goyb.jpg",
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    about: String,
    living: String,
    working: String,
    status: String,
    relationship: String,
    followers: Array,
    following: Array,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
export default User;
