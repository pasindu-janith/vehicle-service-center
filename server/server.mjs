import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import adminRouter from "./src/admin/routes.mjs";
import userRouter from "./src/user/routes.mjs";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data


// Configure file storage using Multer
const uploadDir = './uploads/';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only! (jpeg, jpg, png, gif)'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max file size
  fileFilter: fileFilter,
});

app.use("/api/v1/user/",userRouter);
app.use("/api/v1/admin/",adminRouter);

app.listen(4000, () => console.log("Server is running on port 4000"));
