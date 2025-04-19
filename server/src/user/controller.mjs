import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { tokenGen, tokenGenLogin } from "../utils/jwt.mjs";
import e from "express";

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

    const addUser = await pool.query(
      "INSERT INTO users (user_id, first_name, last_name, email, password, mobile_id, registered_date, user_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        "CUS" + (getMaxUser.rows[0].maxuser + 1),
        fname,
        lname,
        email,
        hashedPassword,
        mobileid,
        formattedDate,
        "2",
      ]
    );

    const otp = String(Math.floor(100000 + Math.random() * 900000)).padStart(
      6,
      "0"
    );
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
      res.cookie("rememberUser", email, {
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
    res.status(200).send({ token: token, user: user.user_id });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const emailVerify = async (req, res) => {
  try {
    const { email, token } = req.query;
    const checkUser = await pool.query(
      "SELECT email_verify_token FROM user WHERE email = $1",
      [email]
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send("Invalid Email");
    }
    const userData = checkUser.rows[0];
    const tokenMatch = await bcrypt.compare(token, userData.email_verify_token);
    if (!tokenMatch) {
      return res.status(400).send({ message: "Invalid token" });
    }
    const updateEmail = await pool.query(
      "UPDATE users SET isemailverified = $1 WHERE email=$2",
      ["1", email]
    );
    res.status(200).send("Email Verified");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      email
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send("Invalid Email");
    }
    const user = checkUser.rows[0];
    //send email with token
    res.status(200).send("Email Sent");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      email
    );
    if (checkUser.rows.length === 0) {
      return res.status(400).send("Invalid Email");
    }
    const userData = checkUser.rows[0];
    const tokenMatch = await bcrypt.compare(token, userData.email_verify_token);
    if (!tokenMatch) {
      return res.status(400).send("Invalid token");
    }
    const strPwd = String(password);
    const hashedPassword = await bcrypt.hash(strPwd, 10);
    const updatePassword = await pool.query(
      "UPDATE users SET password = $1 WHERE email=$2",
      [hashedPassword, email]
    );
    res.status(200).send("Password Updated");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


export const registerVehicle = async (req, res) => {
  try {
    const { vehicle_no, user_id } = req.body;
    const checkVehicle = await pool.query(
      "SELECT * FROM vehicle WHERE vehicle_no = $1",
      vehicle_no
    );
    if (checkVehicle.rows.length > 0) {
      return res.status(400).send("Vehicle already exists");
    }
    const getMaxVehicle = await pool.query(
      "SELECT COUNT(vehicle_id) as maxvehicle FROM vehicle"
    );
    const addVehicle = await pool.query(
      "INSERT INTO vehicle (vehicle_id, vehicle_no, user_id) VALUES ($1, $2, $3)",
      ["VEH00" + getMaxVehicle.rows[0].maxvehicle + 1, vehicle_no, user_id]
    );
    res.status(201).send("Vehicle Added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};





