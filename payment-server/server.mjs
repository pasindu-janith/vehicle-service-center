import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.mjs";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5001;

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
// app.use(cookieParser());

app.post("/api/v1/user/createPayment", (req, res) => {
  console.log("Payment request received:", req.body);
  return res.status(200).json({
    success: true,
    message: "Payment request received successfully",
  });
});

app.listen(PORT, () => console.log("Server is running on port " + PORT));
