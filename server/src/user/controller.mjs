import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { decodeToken, tokenGen, tokenGenLogin } from "../utils/jwt.mjs";
import { verifyToken } from "../utils/jwt.mjs";
import { sendEmail } from "../utils/email.mjs";
import dotenv from "dotenv";
import fs from "fs";
import path, { parse } from "path";
import { get } from "http";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { fname, lname, email, mobile, password } = req.body;
    const strPwd = String(password);
    const hashedPassword = await bcrypt.hash(strPwd, 10);

    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkUser.rows.length > 0) {
      return res.status(400).send("email already exists");
    }

    const checkMobile = await pool.query(
      "SELECT * FROM mobile_number WHERE mobile_no=$1",
      [mobile]
    );

    if (
      checkMobile.rows.length > 0 &&
      checkMobile.rows[0].is_otp_verified === "1"
    ) {
      return res.status(400).send("Mobile number already exists");
    }

    const hashedOTP = await bcrypt.hash("123456", 10);

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 19).replace("T", " ");
    const formattedDate = now.toISOString().split("T")[0];

    if (checkMobile.rows.length === 0) {
      const addMobile = await pool.query(
        "INSERT INTO mobile_number (mobile_no, otp, otp_datetime) VALUES ($1, $2, $3) RETURNING mobile_id",
        [mobile, hashedOTP, currentDateTime]
      );
      var mobileid = addMobile.rows[0].mobile_id;
    } else {
      const updateMobile = await pool.query(
        "UPDATE mobile_number SET otp = $1, otp_datetime = $2 WHERE mobile_no = $3 RETURNING mobile_id",
        [hashedOTP, currentDateTime, mobile]
      );
      var mobileid = checkMobile.rows[0].mobile_id;
    }

    const getMaxUser = await pool.query(
      "SELECT COUNT(user_id) AS maxuser FROM users"
    );

    const addAddress = await pool.query(
      "INSERT INTO addresses (address_line1) VALUES ($1) RETURNING address_id",
      [""]
    );
    var addressID = addAddress.rows[0].address_id;

    const addUser = await pool.query(
      "INSERT INTO users (user_id, first_name, last_name, email, password, mobile_id, registered_date, user_type_id, address_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        "CUS" + (getMaxUser.rows[0].maxuser + 1),
        fname,
        lname,
        email,
        hashedPassword,
        mobileid,
        formattedDate,
        "2",
        addressID,
      ]
    );

    const otp = String(Math.floor(100000 + Math.random() * 900000)).padStart(
      6,
      "0"
    );

    sendVerificationEmail(email);

    res.status(201).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const checkUser = await pool.query(
      "SELECT * FROM users INNER JOIN mobile_number ON users.mobile_id=mobile_number.mobile_id WHERE email = $1 AND status = $2",
      [email, "1"]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid username" });
    }

    const user = checkUser.rows[0];
    if (!user.isemailverified) {
      return res.status(400).send({ message: "Email not verified" });
    }
    if (!user.isotpverified) {
      return res.status(400).send({ message: "Mobile number not verified" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }
    const token = tokenGenLogin(
      { userID: user.user_id, email: user.email },
      rememberMe
    );

    const cookieExpiration = rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000; // 7 days or 1 day

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      maxAge: cookieExpiration,
      path: "/",
    });

    if (rememberMe) {
      res.cookie("rememberUser", encodeURIComponent(email), {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false, // Accessible by JavaScript
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    } else {
      // Clear any existing remember cookie
      res.clearCookie("rememberUser");
    }
    res.status(200).send({
      token: token,
      user: {
        userID: user.user_id,
        email: user.email,
        fname: user.first_name,
        lname: user.last_name,
        mobile: user.mobile_no,
        nicno: user.nicno,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//After clicking on the link at the email for verify email
export const emailVerify = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send({ message: "Token not found" });
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(400).send({ message: "Invalid token" });
    }

    const emailDecoded = decodedToken.email;
    const checkEmail = await pool.query(
      "SELECT isemailverified FROM users WHERE email = $1",
      [emailDecoded]
    );

    if (checkEmail.rows.length === 0) {
      return res
        .status(400)
        .send({ message: "No registered email from this token" });
    }

    const user = checkEmail.rows[0];
    if (user.isemailverified) {
      return res.status(200).send({ message: "Email verified successfully!" });
    }

    const emailadd = verifyToken(token);
    if (!emailadd) {
      return res.status(400).send({ message: "Invalid or Expired token" });
    }

    const updateEmail = await pool.query(
      "UPDATE users SET isemailverified = $1 WHERE email=$2",
      ["1", emailadd.email]
    );
    res.status(200).send({ message: "Email verified successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//Resend the email verification link
export const resendVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const checkEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (checkEmail.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Email address" });
    }
    const user = checkEmail.rows[0];
    if (user.isemailverified) {
      return res
        .status(200)
        .send({ message: "Email already verified. Go to login!" });
    }
    sendVerificationEmail(email);
    res.status(200).send({ message: "Email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//Verify email function
const sendVerificationEmail = async (email) => {
  const token = tokenGen({ email });
  sendEmail(
    email,
    "Shan Automobile and Hybrid Workshop, Email Verification",
    `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color:rgb(33, 33, 33);
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color:rgb(133, 0, 0);
          margin-bottom: 20px;
          font-size: 24px;
          text-align: center;
        }
        p {
          margin-bottom: 25px;
          font-size: 16px;
        }
        .btn {
          background-color:rgb(140, 0, 0);
          text-decoration: none; 
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          display: inline-block;
        }
        .btn:hover {
          background-color:rgb(118, 0, 0);
        }
        .container {
          background-color: #f9f9f9;
          border: 1px solid #dddddd;
          border-radius: 5px;
          padding: 30px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Shan Automobile and Hybrid Workshop Online. Email Verification</h1>
        <p>Thank you for registering with Shan Automobile and Hybrid Workshop. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/signup/emailactivation?token=${token}" class="btn">Click here to verify</a>
        </div>
        <p style="margin-top: 25px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="font-size: 14px;">${process.env.CLIENT_URL}/signup/emailactivation?token=${token}</p>
      </div>
      <div class="footer">
        <p>This email was sent by Shan Automobile and Hybrid Workshop. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
    `
  );
};

//Verify OTP after registration
export const otpVerify = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const checkMobile = await pool.query(
      "SELECT * FROM mobile_number WHERE mobile_no = $1",
      [mobile]
    );
    if (checkMobile.rows.length === 0) {
      return res.status(400).send("Invalid Mobile Number");
    }
    const mobileData = checkMobile.rows[0];
    const otpMatch = await bcrypt.compare(otp, mobileData.otp);
    if (!otpMatch) {
      return res.status(400).send({ message: "Invalid OTP" });
    }
    const updateMobile = await pool.query(
      "UPDATE mobile_number SET isotpverified = $1 WHERE mobile_id=$2 AND mobile_no = $3",
      ["1", mobileData.mobile_id, mobile]
    );
    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

//When user forgets password he will enter email and then this function will be called
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Email" });
    }
    sendPasswordResetEmail(email);
    res.status(200).send({ message: "Email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//Verify email function
const sendPasswordResetEmail = async (email) => {
  const token = tokenGen({ email });
  sendEmail(
    email,
    "Shan Automobile and Hybrid Workshop, Reset Account Password",
    `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color:rgb(33, 33, 33);
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        h1 {
          color:rgb(133, 0, 0);
          margin-bottom: 20px;
          font-size: 24px;
          text-align: center;
        }
        p {
          margin-bottom: 25px;
          font-size: 16px;
        }
        .btn {
          background-color:rgb(245, 161, 161);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
        }
        .btn:hover {
          background-color:rgb(118, 0, 0);
        }
        .container {
          background-color: #f9f9f9;
          border: 1px solid #dddddd;
          border-radius: 5px;
          padding: 30px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #777777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Shan Automobile and Hybrid Workshop Account Password Reset</h1>
        <p>Click the following link to reset your password in your Shan Automobile and Hybrid Workshop online account:</p>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/login/reset-password?token=${token}" class="btn">Click to reset password</a>
        </div>
        <p style="margin-top: 25px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="font-size: 14px;">${process.env.CLIENT_URL}/login/reset-password?token=${token}</p>
      </div>
      <div class="footer">
        <p>This email was sent by Shan Automobile and Hybrid Workshop. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
    `
  );
};

export const verifyResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send({ message: "Token not found" });
    }
    const email = verifyToken(token);
    if (!email) {
      return res.status(400).send({ message: "Invalid token" });
    }
    const checkEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.email]
    );
    if (checkEmail.rows.length === 0) {
      return res
        .status(400)
        .send({ message: "Email not found. Check the link again." });
    }
    res.status(200).send({ message: "Token verified" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//After clicking on the link at the email for reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const email = verifyToken(token);
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.email,
    ]);
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Email" });
    }
    const strPwd = String(password);
    const hashedPassword = await bcrypt.hash(strPwd, 10);
    const updatePassword = await pool.query(
      "UPDATE users SET password = $1 WHERE email=$2",
      [hashedPassword, email.email]
    );
    res.status(200).send({ message: "Password updated" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//Load user data and give current user data
// This function retrieves the user data from the database based on the token in the cookies
// It verifies the token and checks if the user exists in the database
// If the user exists, it returns the user data in the response

export const loadUserData = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Unauthorized");
    }
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).send("Unauthorized");
    }
    const userID = decodedToken.userID;
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send("Invalid User");
    }
    const user = checkUser.rows[0];
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

//Check if user is authorized
export const authUser = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send({ message: "No cookies available" }); // This function checks if the user is authorized by verifying the token in the cookies
    }
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(401).send({ message: "Unauthorized" }); // It returns a 401 status if the token is not present or invalid, and a 200 status if the user is authorized
    }
    const userID = decodedToken.userID;
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" }); // It also checks if the user exists in the database and returns a 400 status if not
    }
    res.status(200).send({ message: "Authorized" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//Logout function
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).send({ message: "Logged out" });
};

const getUserIDFromToken = (token, res) => {
  if (!token) {
    return res.status(401).send({ message: "No cookies available" });
  }
  const decodedToken = decodeToken(token);
  if (!decodedToken) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  return decodedToken.userID;
};

export const registerVehicle = async (req, res) => {
  try {
    const {
      licensePlate,
      vehicleType,
      make,
      model,
      color,
      year,
      transmission,
      fuelType,
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (
      !licensePlate ||
      !vehicleType ||
      !make ||
      !model ||
      !color ||
      !year ||
      !transmission ||
      !fuelType
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!imagePath) {
      return res.status(400).json({ message: "Vehicle image is required" });
    }

    const checkVehicle = await pool.query(
      "SELECT * FROM vehicles WHERE license_plate = $1",
      [licensePlate]
    );
    if (checkVehicle.rows.length > 0 && checkVehicle.rows[0].status === "1") {
      return res
        .status(400)
        .json({ message: "Vehicle already exists from this license" });
    } else if (
      checkVehicle.rows.length > 0 &&
      checkVehicle.rows[0].status === "0"
    ) {
      // If the vehicle exists but is deleted, update it
      const updateVehicle = await pool.query(
        "UPDATE vehicles SET user_id = $1, vehicle_type_id = $2, vehicle_brand_id = $3, model = $4, color = $5, make_year = $6, status = $7, fuel_type = $8, transmission_type = $9, imgpath = $10 WHERE license_plate = $11",
        [
          userID,
          vehicleType,
          make,
          model,
          color,
          year,
          "1", // Set status to active
          fuelType,
          transmission,
          imagePath,
          licensePlate,
        ]
      );
      if (updateVehicle.rowCount === 0) {
        return res.status(400).json({ message: "Failed to update vehicle" });
      }
    }

    const addVehicle = await pool.query(
      "INSERT INTO vehicles (license_plate, user_id, vehicle_type_id, vehicle_brand_id, model, color, make_year, status, fuel_type,transmission_type,imgpath) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        licensePlate,
        userID,
        vehicleType,
        make,
        model,
        color,
        year,
        "1",
        fuelType,
        transmission,
        imagePath,
      ]
    );

    res.status(200).json({
      message: "Vehicle registered successfully",
    });
  } catch (error) {
    console.error("Error handling form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicleID = req.query.licensePlate;
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!vehicleID) {
      return res.status(400).send({ message: "Vehicle ID is required" });
    }
    const checkVehicle = await pool.query(
      "SELECT * FROM vehicles WHERE license_plate = $1 AND user_id = $2",
      [vehicleID, userID]
    );
    if (checkVehicle.rows.length === 0) {
      return res.status(400).send({ message: "Vehicle not found" });
    }
    const deleteVehicl = await pool.query(
      "UPDATE vehicles SET status = $1 WHERE license_plate = $2",
      ["0", vehicleID]
    );
    res.status(200).send({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Load vehicle types function
export const loadVehicleTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT vehicle_type_id, vehicle_type FROM vehicle_type ORDER BY vehicle_type ASC"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No vehicle types found" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vehicle types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loadVehicleBrands = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT vehicle_brand_id, vehicle_brand FROM vehicle_brand ORDER BY vehicle_brand ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vehicle types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loadFuelTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT fuel_type_id, fuel_type FROM fuel_type ORDER BY fuel_type ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vehicle types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loadTransmissionTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT transmission_type_id,transmission_type FROM transmission_type ORDER BY transmission_type ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vehicle types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loadServiceTypes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM service_type");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vehicle types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const checkProfileUpdated = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    const checkUser = await pool.query(
      "SELECT nicno FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];
    if (user.nicno) {
      return res.status(200).send({ message: "Profile updated" });
    } else {
      return res.status(400).send({ message: "Profile not updated" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const loadAllUserData = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);

    const checkUser = await pool.query(
      "SELECT * FROM users LEFT JOIN addresses ON users.address_id = addresses.address_id LEFT JOIN mobile_number ON users.mobile_id = mobile_number.mobile_id WHERE users.user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

export const updateUserProfileData = async (req, res) => {
  try {
    const { token } = req.cookies;

    const userID = getUserIDFromToken(token, res);
    const {
      fname,
      lname,
      nic,
      email,
      mobile,
      addressNo,
      addressLane,
      addressCity,
    } = req.body;

    if (
      !fname ||
      !lname ||
      !nic ||
      !email ||
      !mobile ||
      !addressNo ||
      !addressLane ||
      !addressCity
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];

    const updateUser = await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, nicno = $3, email = $4 WHERE user_id = $5",
      [fname, lname, nic, email, userID]
    );
    const updateAddress = await pool.query(
      "UPDATE addresses SET address_line1 = $1, address_line2 = $2, address_line3 = $3 WHERE address_id=$4",
      [addressNo, addressLane, addressCity, user.address_id]
    );

    const updateMobile = await pool.query(
      "UPDATE mobile_number SET mobile_no = $1 WHERE mobile_id=$2",
      [mobile, user.mobile_id]
    );

    return res.status(200).send({ message: "Profile updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

export const loadAllUserVehicles = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];
    const vehicles = await pool.query(
      "SELECT * FROM vehicles NATURAL JOIN vehicle_brand NATURAL JOIN vehicle_type WHERE user_id = $1 AND status=$2",
      [user.user_id, "1"]
    );
    return res.status(200).send(vehicles.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

//use for reset password which is already logged in user
// This function updates the user's password in the database after verifying the old password
export const updateUserPassword = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).send({ message: "Invalid current password" });
    }
    const strPwd = String(newPassword);
    const hashedPassword = await bcrypt.hash(strPwd, 10);
    const updatePassword = await pool.query(
      "UPDATE users SET password = $1 WHERE user_id=$2",
      [hashedPassword, userID]
    );
    return res.status(200).send({ message: "Password updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

export const createReservation = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    const {
      vehicleID,
      serviceType,
      serviceDate,
      serviceStartTime,
      serviceEndTime,
      note,
    } = req.body;

    if (
      !vehicleID ||
      !serviceType ||
      !serviceDate ||
      !serviceStartTime ||
      !serviceEndTime
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }

    const serviceTypes = await pool.query(
      "SELECT * FROM service_type WHERE service_type_id = $1",
      [serviceType]
    );

    if (serviceTypes.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Service Type" });
    }

    const service_type = serviceTypes.rows[0];

    // Check for overlapping reservation for the same vehicle
    const vehicleOverlapCheck = await pool.query(
      `SELECT * FROM reservations
       WHERE vehicle_id = $1
         AND reserve_date = $2
         AND NOT (end_time <= $3 OR start_time >= $4)
         AND reservation_status = $5`,
      [vehicleID, serviceDate, serviceStartTime, serviceEndTime, "1"]
    );

    if (vehicleOverlapCheck.rows.length > 0) {
      return res.status(400).send({
        message:
          "This vehicle already has a reservation during the selected time.",
      });
    }

    // Check how many reservations exist at this time slot for this service type
    const existingReservations = await pool.query(
      `SELECT COUNT(*) AS count FROM reservations
       WHERE reserve_date = $1
         AND NOT (end_time <= $2 OR start_time >= $3)
         AND service_type_id = $4
         AND reservation_status = $5`,
      [serviceDate, serviceStartTime, serviceEndTime, serviceType, "1"]
    );

    const currentCount = parseInt(existingReservations.rows[0].count, 10);
    if (currentCount >= parseInt(service_type.max_count, 10)) {
      return res.status(400).send({
        message:
          "Max reservations reached during this time. Try another time slot.",
      });
    }

    // Add reservation
    await pool.query(
      `INSERT INTO reservations 
        (vehicle_id, service_type_id, reserve_date, end_date, start_time, end_time, notes, reservation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING reservation_id`,
      [
        vehicleID,
        serviceType,
        serviceDate,
        serviceDate, // Assuming end_date is the same as reserve_date for v1
        serviceStartTime,
        serviceEndTime,
        note,
        "1",
      ]
    );

    return res.status(200).send({ message: "Reservation created" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const loadAllUserReservations = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];
    const reservations = await pool.query(
      `SELECT * FROM reservations NATURAL JOIN service_type INNER JOIN reservation_status 
      ON reservations.reservation_status=reservation_status.reservation_status_id WHERE vehicle_id 
      IN (SELECT license_plate FROM vehicles WHERE user_id = $1 AND status=$2)`,
      [userID, "1"]
    );
    return res.status(200).send(reservations.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservationID = req.query.rid;

    if (!reservationID) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }

    const checkReservation = await pool.query(
      "SELECT * FROM reservations WHERE reservation_id = $1",
      [reservationID]
    );
    if (checkReservation.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Reservation ID" });
    }

    const cancelReservation = await pool.query(
      "UPDATE reservations SET reservation_status = $1 WHERE reservation_id=$2",
      ["4", reservationID]
    );

    return res.status(200).send({ message: "Reservation cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};



export const loadAllUserNotifications = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    const user = checkUser.rows[0];
    const notifications = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1`,
      [userID]
    );
    return res.status(200).send(notifications.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};
