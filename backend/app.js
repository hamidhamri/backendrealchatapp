import express from "express";
import { GlobalErrorHandler } from "./utils/GlobalErrorHandler.js";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";

//ROUTES
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import uploadImageRoute from "./routes/uploadRoute.js";
import commentRoute from "./routes/commentRoute.js";
import chatRoute from "./routes/chatRoute.js";
import messageRoute from "./routes/messageRoute.js";
import notificationRoute from "./routes/notificationsRoute.js";

dotenv.config({ path: "./.env" });
const app = express();
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const __dirname = path.resolve();
app.use("/images", express.static(path.join(__dirname, "images")));
// app.use("/images", express.static("images"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/chats", chatRoute);
app.use("/api/v1/messages", messageRoute);
app.use("/api/v1/images/upload", uploadImageRoute);
app.use("/api/v1/notifications", notificationRoute);

app.use(GlobalErrorHandler);

export default app;
