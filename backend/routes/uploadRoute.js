import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split("/")[1]}`);
  },
});
const upload = multer({
  storage,
  checkFileType: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only!");
  },
});

router.post(
  "/",
  upload.fields([
    { name: "postImage", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 },
  ]),
  (req, res) => {
    const { postImage, profilePic, coverPic } = req.files;

    if (postImage) {
      // sharp(postImage[0].path).toFile(
      //   `./images/resize-${postImage[0].filename}`
      // );
      // res.send(`/images/resize-${postImage[0].filename}`);
      // console.log(postImage[0].filename);
      // console.log(postImage[0]);
      res.send(`/${postImage[0].path}`);
    }
    if (profilePic) {
      // sharp(profilePic[0].path).toFile(
      //   `./images/resize-${profilePic[0].filename}`
      // );
      // res.send(`/images/resize-${profilePic[0].filename}`);
      res.send(`/${profilePic[0].path}`);
    }
    if (coverPic) {
      // sharp(coverPic[0].path).toFile(`./images/resize-${coverPic[0].filename}`);
      // res.send(`/images/resize-${coverPic[0].filename}`);
      res.send(`/${coverPic[0].path}`);
    }

    // sharp(req.file.path)
    //   .resize(500)
    //   ;
    // sharp.cache(false);
    // res.send(`/images/resize-${req.file.filename}`);
    // res.send("success");
  }
);

export default router;
