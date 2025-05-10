import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import adminRouter from "./src/admin/routes.mjs";
import userRouter from "./src/user/routes.mjs";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = ["http://localhost:5173", "http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(cookieParser()); 

// Load environment variables
const uploadDir = "./uploads/";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/v1/user/", userRouter);
app.use("/api/v1/admin/", adminRouter);
app.listen(4000, () => console.log("Server is running on port 4000"));
