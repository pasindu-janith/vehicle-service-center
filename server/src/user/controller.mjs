import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { decodeToken, tokenGen, tokenGenLogin } from "../utils/jwt.mjs";
import { verifyToken } from "../utils/jwt.mjs";
import { sendEmail } from "../utils/email.mjs";
import { sendSMS } from "../utils/sms.mjs";
import supabase from "../middleware/supabase.mjs";
import dotenv from "dotenv";
import crypto from "crypto";

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

    const otpGenerated = String(
      Math.floor(100000 + Math.random() * 900000)
    ).padStart(6, "0");

    const hashedOTP = await bcrypt.hash(otpGenerated, 10);

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
        "CUS" + (parseInt(getMaxUser.rows[0].maxuser) + 1),
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
    const messageText = `Your OTP for Shan Automobile and Hybrid Workshop registration is ${otpGenerated}. Please do not share this OTP with anyone.`;
    const smsResponse = await sendSMS("+94" + mobile, messageText);
    if (!smsResponse.success) {
      return res.status(500).send({ message: "Failed to send OTP via SMS" });
    }

    const emailResponse = await sendVerificationEmail(email);
    if (!emailResponse.success) {
      return res
        .status(500)
        .send({ message: "Failed to send verification email" });
    }
    res.status(201).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const checkMobileorEmail = email.includes("@") ? "email" : "mobile_no";

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
      sameSite: "None",
      maxAge: cookieExpiration,
      path: "/",
    });

    if (rememberMe) {
      res.cookie("rememberUser", encodeURIComponent(email), {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false, // Accessible by JavaScript
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
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
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .header {
            background-color: rgb(140, 0, 0);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
          }
          .content {
            background-color: #ffffff;
            padding: 40px 20px;
            max-width: 100%;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
            color: #555555;
          }
          .btn {
            background-color: rgb(140, 0, 0);
            color: #ffffff !important;
            padding: 14px 28px;
            text-decoration: none !important;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            display: inline-block;
            margin-top: 15px;
          }
          .btn:hover {
            background-color: rgb(118, 0, 0);
          }
          .link {
            font-size: 14px;
            word-break: break-all;
            color: rgb(140, 0, 0);
          }
          .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Email Verification</h1>
        </div>

        <div class="content">
          <p>Dear Customer,</p>
          <p>
            Thank you for registering with <strong>Shan Automobile and Hybrid Workshop</strong>.  
            To complete your registration and activate your account, please verify your email address by clicking the button below:
          </p>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/signup/emailactivation?token=${token}" class="btn">Verify My Email</a>
          </p>

          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p class="link">${process.env.CLIENT_URL}/signup/emailactivation?token=${token}</p>
        </div>

        <div class="footer">
          <p>
            This email was sent by Shan Automobile and Hybrid Workshop.  
            If you didn’t create an account, you can safely ignore this email.
          </p>
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
    if (mobileData.isotpverified === "1") {
      return res.status(200).send({ message: "OTP already verified" });
    }

    if (mobileData.otp_datetime) {
      const otpDateTime = new Date(mobileData.otp_datetime);
      const currentDateTime = new Date();
      const timeDifference = currentDateTime - otpDateTime;
      const otpValidityDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
      if (timeDifference > otpValidityDuration) {
        return res.status(400).send({
          message: "OTP expired. Generate a new OTP and verify again.",
        });
      }
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
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None", 
    path: "/",          
  });
  
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
    const file = req.file;

    // const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
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
    if (!file) {
      return res.status(400).json({ message: "Vehicle image is required" });
    }
    const fileName = `${Date.now()}-${Math.floor(
      Math.random() * 1000000000
    )}${file.originalname.substring(file.originalname.lastIndexOf("."))}`;

    const { error } = await supabase.storage
      .from("vehicle-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) return res.status(500).json({ error: error.message });

    // build public URL manually (same format as your DB value)
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/vehicle-images/${fileName}`;

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
          publicUrl,
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
        publicUrl, // Use the public URL of the uploaded image
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
       AND $2 BETWEEN reserve_date AND end_date
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

    // Count overlapping reservations for the same service type in the requested date/time range
    const existingReservations = await pool.query(
      `SELECT COUNT(*) AS count FROM reservations 
        WHERE service_type_id = $1
        AND reservation_status = $2
        AND (
        (reserve_date + start_time::interval) < $3::timestamp
        AND
        (end_date + end_time::interval) > $4::timestamp
        )`,
      [
        serviceType,
        "1",
        `${serviceDate} ${serviceEndTime}`, // '2025-05-24 11:00:00'
        `${serviceDate} ${serviceStartTime}`, // '2025-05-22 10:00:00'
      ]
    );

    const currentCount = parseInt(existingReservations.rows[0].count, 10);
    if (currentCount >= parseInt(service_type.max_count, 10)) {
      return res.status(400).send({
        message:
          "Max reservations reached during this time. Try another time slot.",
      });
    }

    // Add reservation
    const reservationInsertResult = await pool.query(
      `INSERT INTO reservations 
        (vehicle_id, service_type_id, reserve_date, end_date, start_time, end_time, notes, reservation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING reservation_id`,
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
    const reservationID = reservationInsertResult.rows[0].reservation_id;

    await sendReservationCreationEmail(checkUser.rows[0].email, {
      reservationID: reservationID, // Assuming vehicleID is used as reservation ID
      vehicleID,
      serviceType: service_type.service_name,
      serviceDate,
      serviceStartTime,
      notes: note,
    });
    return res.status(200).send({ message: "Reservation created" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const sendReservationCreationEmail = async (email, reservationDetails) => {
  const {
    reservationID,
    vehicleID,
    serviceType,
    serviceDate,
    serviceStartTime,
    notes,
  } = reservationDetails;
  const token = tokenGen({ email });
  sendEmail(
    email,
    "Shan Automobile and Hybrid Workshop, Reservation Confirmation",
    `
    <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Confirmation</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      background-color: rgb(140, 0, 0);
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 22px;
    }
    .content {
      padding: 30px 25px;
    }
    .content p {
      font-size: 15px;
      margin-bottom: 20px;
      color: #555555;
    }
    .details {
      background-color: #f9f9f9;
      padding: 15px 20px;
      border: 1px solid #dddddd;
      border-radius: 4px;
      margin-bottom: 25px;
    }
    .details ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .details li {
      font-size: 15px;
      padding: 8px 0;
      border-bottom: 1px solid #eeeeee;
    }
    .details li:last-child {
      border-bottom: none;
    }
    .details strong {
      color: rgb(140, 0, 0);
    }
    .btn {
      background-color: rgb(140, 0, 0);
      color: #ffffff !important;
      padding: 12px 24px;
      text-decoration: none !important;
      border-radius: 4px;
      font-weight: bold;
      display: inline-block;
      font-size: 15px;
    }
    .btn:hover {
      background-color: rgb(118, 0, 0);
    }
    .footer {
      background-color: #f4f4f4;
      padding: 15px;
      font-size: 12px;
      color: #777777;
      text-align: center;
    }
    @media screen and (max-width: 600px) {
      .content {
        padding: 20px;
      }
    }
  </style>
  </head>
  <body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Reservation Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Your reservation has been successfully created with the following details:</p>
      
      <div class="details">
        <ul>
          <li><strong>Reservation ID:</strong> ${reservationID}</li>
          <li><strong>Vehicle ID:</strong> ${vehicleID}</li>
          <li><strong>Service Type:</strong> ${serviceType}</li>
          <li><strong>Service Date:</strong> ${serviceDate}</li>
          <li><strong>Reserved Time:</strong> ${serviceStartTime}</li>
          <li><strong>Your notes:</strong> ${notes}</li>
        </ul>
      </div>
      <p>Please be there at your reserved time.</p>
      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/myaccount/reservations" class="btn">View My Reservation</a>
      </p>

      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 14px; color: rgb(140, 0, 0);">
        ${process.env.CLIENT_URL}/myaccount/reservations
      </p>
    </div>
    <div class="footer">
      <p>This email was sent by Shan Automobile and Hybrid Workshop. If you did not make this reservation, please ignore this email.</p>
    </div>
    </div>
    </body>
    </html>

  `
  );
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
      `SELECT r.vehicle_id,r.reservation_id,r.start_time,r.reserve_date,r.end_date,r.end_time,r.notes,st.service_name,rs.status_name,sr.is_paid
      FROM reservations r NATURAL JOIN service_type st INNER JOIN reservation_status rs
      ON r.reservation_status=rs.reservation_status_id LEFT JOIN service_records sr ON r.reservation_id=sr.reservation_id
      WHERE r.vehicle_id IN (SELECT license_plate FROM vehicles WHERE user_id = $1 AND status=$2)`,
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
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);

    if (!reservationID) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }

    const checkReservation = await pool.query(
      "SELECT * FROM reservations r INNER JOIN service_type st ON r.service_type_id=st.service_type_id WHERE reservation_id = $1 AND vehicle_id IN (SELECT license_plate FROM vehicles WHERE user_id = $2 AND status=$3) AND reservation_status=$4",
      [reservationID, userID, "1", "1"]
    );
    if (checkReservation.rows.length === 0) {
      return res
        .status(400)
        .send({ message: "This Reservation cannot be cancelled" });
    }

    const cancelReservation = await pool.query(
      "UPDATE reservations SET reservation_status = $1 WHERE reservation_id=$2",
      ["4", reservationID]
    );
    sendEmail(
      checkUser.rows[0].email,
      "Shan Automobile and Hybrid Workshop, Reservation Cancelled",
      `
      <!DOCTYPE html>
      <html>  
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Cancelled</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          color: #333333;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          background-color: rgb(140, 0, 0);
          padding: 20px;
          text-align: center;
        }
        .header h1 {  
          color: #ffffff;
          margin: 0;
          font-size: 22px;
        } 
        .content {
          padding: 30px 25px;
        }
        .content p {
          font-size: 15px;
          margin-bottom: 20px;
          color: #555555;
        }
        .details {
          background-color: #f9f9f9;
          padding: 15px 20px;
          border: 1px solid #dddddd;
          border-radius: 4px;
          margin-bottom: 25px;
        }
        .details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .details li {
          font-size: 15px;
          padding: 8px 0;
          border-bottom: 1px solid #eeeeee;
        }
        .details li:last-child {
          border-bottom: none;
        }
        .details strong {
          color: rgb(140, 0, 0);
        } 
        .footer {
          background-color: #f4f4f4;
          padding: 15px;
          font-size: 12px;
          color: #777777;
          text-align: center;
        }
        @media screen and (max-width: 600px) {
          .content {
            padding: 20px;
          }
        }
      </style>
      </head>
      <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>Reservation Cancelled</h1>
        </div>  
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your reservation with the following details has been successfully cancelled:</p>
          <div class="details">
            <ul>
              <li><strong>Reservation ID:</strong> ${checkReservation.rows[0].reservation_id}</li>
              <li><strong>Vehicle ID:</strong> ${checkReservation.rows[0].vehicle_id}</li>
              <li><strong>Service Type:</strong> ${checkReservation.rows[0].service_name}</li>
              <li><strong>Service Date:</strong> ${checkReservation.rows[0].reserve_date}</li>
              <li><strong>Reserved Time:</strong> ${checkReservation.rows[0].start_time}</li>
              <li><strong>Cancelled By:</strong> User(${userID})checkReservation.rows[0].notes}</li>
            </ul>
          </div>
          <p>If you did not make this cancellation, please contact us immediately.</p>
        </div>
        <div class="footer">

          <p>This email was sent by Shan Automobile and Hybrid Workshop. If you did not make this cancellation, please contact us immediately.</p>
        </div>
        </div>
        </body>
        </html>
    `
    );
    return res.status(200).send({ message: "Reservation cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

// Fetch vehicle data for the user for vehicle info page with its all service records
// This function retrieves the vehicle data and service records for a specific vehicle owned by the user
export const fetchVehicleData = async (req, res) => {
  try {
    const vehicleID = req.query.licensePlate;
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!vehicleID) {
      return res.status(400).send({ message: "Vehicle ID is required" });
    }
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const vehicleData = await pool.query(
      `SELECT * 
      FROM vehicles AS v
      INNER JOIN vehicle_brand AS vb ON v.vehicle_brand_id = vb.vehicle_brand_id
      INNER JOIN vehicle_type AS vt ON v.vehicle_type_id = vt.vehicle_type_id
      INNER JOIN transmission_type AS t ON v.transmission_type = t.transmission_type_id
      INNER JOIN fuel_type AS f ON v.fuel_type = f.fuel_type_id
      WHERE v.license_plate = $1 AND v.user_id = $2
      `,
      [vehicleID, userID]
    );

    // const serviceRecords = await pool.query(
    //   `SELECT sr.reservation_id, sr.service_description, sr.service_cost, sr.final_amount, st.service_name, r.reserve_date, r.start_time, r.end_date, r.end_time, sr.is_paid
    //   FROM service_records AS sr
    //   INNER JOIN reservations AS r ON sr.reservation_id = r.reservation_id
    //   INNER JOIN service_type AS st ON r.service_type_id = st.service_type_id
    //   WHERE sr.vehicle_id = $1
    //   ORDER BY sr.created_datetime DESC`,
    //   [vehicleID]
    // );

    const serviceRecords = await pool.query(
      `SELECT sr.reservation_id, 
          sr.service_description, 
          sr.service_cost, 
          sr.discount,
          sr.final_amount, 
          st.service_name, 
          r.reserve_date, 
          r.start_time, 
          r.end_date, 
          r.end_time, 
          sr.is_paid,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'description', pi.description,
                'price', pi.price
              )
            ) FILTER (WHERE pi.id IS NOT NULL), 
            '[]'
          ) AS payment_items
            FROM service_records AS sr
            INNER JOIN reservations AS r 
            ON sr.reservation_id = r.reservation_id
            INNER JOIN service_type AS st 
            ON r.service_type_id = st.service_type_id
            LEFT JOIN payment_item AS pi 
            ON sr.reservation_id = pi.reservation_id
            WHERE sr.vehicle_id = $1
            GROUP BY sr.reservation_id, sr.service_description, sr.service_cost, sr.discount, sr.final_amount,
            st.service_name, r.reserve_date, r.start_time, r.end_date, r.end_time, sr.is_paid`,
      [vehicleID]
    );

    if (vehicleData.rows.length === 0) {
      return res.status(400).send({ message: "Vehicle not found" });
    }
    return res.status(200).send({
      vehicleData: vehicleData.rows[0],
      serviceRecords: serviceRecords.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// Load service record pending payment data for the user for payment page
export const loadPendingPayment = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const paymentData = await pool.query(
      `SELECT r.reservation_id, r.vehicle_id, r.reserve_date, r.start_time, r.end_date, r.end_time, st.service_name, sr.final_amount
      FROM reservations AS r
      INNER JOIN service_records AS sr ON sr.reservation_id = r.reservation_id
      INNER JOIN service_type AS st ON r.service_type_id = st.service_type_id
      INNER JOIN vehicles AS v ON r.vehicle_id = v.license_plate
      WHERE v.user_id = $1 AND r.reservation_status = $2 AND is_paid = $3`,
      [userID, "3", "0"]
    );
    if (paymentData.rows.length === 0) {
      return res.status(404).send({ message: "No service records found" });
    }
    return res.status(200).send(paymentData.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// once user go to proceed payment page, this function will be called
// It retrieves the payment data for a specific reservation and user
export const loadPaymentPageData = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { resid } = req.query;
    const reservationID = resid;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    if (!reservationID) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }

    const paymentData = await pool.query(
      `SELECT *
      FROM reservations AS r
      INNER JOIN service_records AS sr ON sr.reservation_id = r.reservation_id
      INNER JOIN service_type AS st ON r.service_type_id = st.service_type_id
      INNER JOIN vehicles AS v ON r.vehicle_id = v.license_plate
      WHERE r.reservation_id = $1 AND reservation_status = $2 AND v.user_id= $3`,
      [reservationID, "3", userID]
    );
    if (paymentData.rows.length === 0) {
      return res.status(404).send({ message: "No service records found" });
    }
    const userData = await pool.query(
      `SELECT * FROM users AS u 
      INNER JOIN mobile_number AS m ON u.mobile_id=m.mobile_id
      INNER JOIN addresses AS a ON u.address_id=a.address_id WHERE u.user_id = $1`,
      [userID]
    );
    if (userData.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }

    const paymentItem = await pool.query(
      `SELECT description, price FROM payment_item WHERE reservation_id = $1`,
      [reservationID]
    );

    return res.status(200).send({
      reservationData: paymentData.rows[0],
      userData: userData.rows[0],
      paymentItems: paymentItem ? paymentItem.rows : null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// Fetch reservation data for the user for reservation info page for a specific reservation
export const fetchReservationData = async (req, res) => {
  try {
    const { resid } = req.query;
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    if (!resid) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }
    const reservationData = await pool.query(
      `SELECT * FROM reservations r 
      INNER JOIN service_type st ON r.service_type_id = st.service_type_id
      INNER JOIN vehicles v ON r.vehicle_id = v.license_plate
      INNER JOIN reservation_status rs ON r.reservation_status = rs.reservation_status_id
      WHERE r.reservation_id = $1 AND v.user_id = $2`,
      [resid, userID]
    );

    if (reservationData.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "Reservation not found for this user" });
    }
    return res.status(200).send({
      reservationData: reservationData.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const generatePayHash = async (req, res) => {
  const { merchant_id, order_id, amount, currency } = req.body;
  const merchant_secret = process.env.MERCHANT_SECRET;

  if (!merchant_id || !order_id || !amount || !currency || !merchant_secret) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const formattedAmount = parseFloat(amount).toFixed(2);

  const innerHash = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")
    .toUpperCase();

  const rawString =
    merchant_id + order_id + formattedAmount + currency + innerHash;

  const finalHash = crypto
    .createHash("md5")
    .update(rawString)
    .digest("hex")
    .toUpperCase();

  res.json({ hash: finalHash });
};

export const getReservationMessages = async (req, res) => {
  try {
    const { resid } = req.query;
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    if (!resid) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }
    const checkReservation = await pool.query(
      `SELECT * FROM reservations r
      INNER JOIN vehicles v ON r.vehicle_id = v.license_plate
      WHERE r.reservation_id = $1 AND v.user_id = $2`,
      [resid, userID]
    );
    if (checkReservation.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Reservation ID" });
    }

    const messages = await pool.query(
      `SELECT * FROM reservation_messages WHERE reservation_id = $1 ORDER BY created_at ASC`,
      [resid]
    );
    if (messages.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "No messages found for this reservation" });
    }
    return res.status(200).send(messages.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const sendReservationMessage = async (req, res) => {
  try {
    const { reservationId, message } = req.body;
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    if (!reservationId || !message) {
      return res
        .status(400)
        .send({ message: "Reservation ID and message are required" });
    }
    const checkReservation = await pool.query(
      `SELECT * FROM reservations r 
      INNER JOIN vehicles v ON r.vehicle_id = v.license_plate
      WHERE r.reservation_id = $1 AND v.user_id = $2`,
      [reservationId, userID]
    );
    if (checkReservation.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Reservation ID" });
    }
    const insertMessage = await pool.query(
      `INSERT INTO reservation_messages (reservation_id, role, message, created_at) 
      VALUES ($1, $2, $3, $4)`,
      [reservationId, "2", message, new Date()]
    );
    return res.status(200).send({ message: "Message sent" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadDashboardNotifications = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { today } = req.query;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const notifications = await pool.query(
      `SELECT * FROM notifications n INNER JOIN notification_type t 
      ON n.notification_type=t.notification_type_id WHERE (user_id = $1 OR user_id IS NULL) AND date_range @> DATE '${today}' ORDER BY id DESC LIMIT 7`,
      [userID]
    );
    if (notifications.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "No notifications found for this user" });
    }
    return res.status(200).send(notifications.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const updatePaymentDetails = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1, // we can use this for customer id
      custom_2, // we can use this for discount
      method,
      status_message,
    } = req.body;

    const localSig = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          crypto
            .createHash("md5")
            .update(MERCHANT_SECRET)
            .digest("hex")
            .toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    if (localSig !== md5sig) {
      return res.status(400).send("Invalid signature");
    }

    const checkInvoice = await pool.query(
      `SELECT * FROM reservations r INNER JOIN service_records sr ON 
      r.reservation_id=sr.reservation_id WHERE reservation_id = $1 AND is_paid=$2`,
      [order_id, "0"]
    );

    if (status_code !== 2) {
      return res.status(400).send("Payment not successful");
    }

    if (checkInvoice.rows.length === 0) {
      return res.status(400).send("Invalid or already paid reservation");
    }

    const invoice = await pool.query(
      `INSERT INTO invoices
          (customer_id, reservation_id, service_cost, discount, final_amount, created_datetime)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING invoice_id`,
      [
        custom_1,
        order_id, // reservation_id
        payhere_amount + custom_2 || 0,
        custom_2 || 0,
        payhere_amount,
        new Date(),
      ]
    );
    const invoiceID = invoice.rows[0].invoice_id;
    await pool.query(
      `INSERT INTO payment 
       (invoice_id, payhere_order_id, transact_amount, transaction_datetime, transaction_status) 
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [invoiceID, payment_id, method, payhere_amount, new Date(), "SUCCESS"]
    );

    await pool.query(
      `UPDATE service_records SET is_paid=$1 WHERE reservation_id=$2`,
      ["1", order_id]
    );

    res.status(200).send("Invoice and Payment recorded");
  } catch (err) {
    console.error("PayHere notify error:", err);
    res.status(500).send("Server error");
  }
};

export const loadCompletedPayments = async (req, res) => {
  try {
    const { token } = req.cookies;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [userID]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }

    const loadPayments = await pool.query(
      `SELECT * FROM invoices i INNER JOIN reservations r ON i.reservation_id = r.reservation_id
      INNER JOIN payments p ON i.invoice_id = p.invoice_id INNER JOIN service_type s ON r.service_type_id = s.service_type_id
      INNER JOIN users u ON u.user_id = i.customer_id WHERE p.payment_status = $1 AND u.user_id = $2`,
      ["SUCCESS", userID]
    );
    if (loadPayments.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "No completed payment records found" });
    }

    res.status(200).send(loadPayments.rows);
  } catch (error) {
    console.error("Error loading completed payment page data:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadInvoiceData = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { resid } = req.query;
    const userID = getUserIDFromToken(token, res);
    if (!userID) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    if (!resid) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }
    const invoiceData = await pool.query(
      `SELECT * FROM invoices i INNER JOIN payments p ON i.invoice_id = p.invoice_id INNER JOIN
       users u ON u.user_id = i.customer_id INNER JOIN mobile_number m ON m.mobile_id=u.mobile_id 
       WHERE p.payment_status = $1 AND u.user_id = $2 AND i.reservation_id=$3`,
      ["SUCCESS", userID, resid]
    );

    if (invoiceData.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "No invoice data found for this user" });
    }

    const completedServices = await pool.query(
      `SELECT sr.reservation_id, 
          sr.service_description,
          st.service_name, 
          v.license_plate,
          vt.vehicle_type,
          vb.vehicle_brand,
          v.model,
          r.reserve_date, 
          r.end_date, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'description', pi.description,
                'price', pi.price
              )
            ) FILTER (WHERE pi.id IS NOT NULL), 
            '[]'
          ) AS payment_items
            FROM service_records AS sr
            INNER JOIN reservations AS r 
            ON sr.reservation_id = r.reservation_id
            INNER JOIN service_type AS st 
            ON r.service_type_id = st.service_type_id
            INNER JOIN vehicles AS v
            ON r.vehicle_id = v.license_plate
            INNER JOIN vehicle_type AS vt
            ON v.vehicle_type_id = vt.vehicle_type_id
            INNER JOIN vehicle_brand AS vb
            ON v.vehicle_brand_id = vb.vehicle_brand_id
            LEFT JOIN payment_item AS pi 
            ON sr.reservation_id = pi.reservation_id
            WHERE r.reservation_id = $1
            GROUP BY sr.reservation_id, sr.service_description, st.service_name, r.reserve_date, r.end_date, 
            v.license_plate, vt.vehicle_type, vb.vehicle_brand, v.model`,
      [resid]
    );

    return res.status(200).send({
      invoiceData: invoiceData.rows[0],
      completedService: completedServices.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
