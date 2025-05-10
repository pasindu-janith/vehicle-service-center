import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { tokenGenLogin } from "../utils/jwt.mjs";

// Admin login controller
export const adminLogin = async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    const checkAdmin = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND status = $2 AND user_type_id = $3",
      [email, "1", "1"]
    );

    if (checkAdmin.rows.length === 0) {
      return res.status(400).send({ message: "Invalid admin credentials" });
    }

    const admin = checkAdmin.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const token = tokenGenLogin({ adminID: admin.user_id, email: admin.email });
    const cookieExpiration = 24 * 60 * 60 * 1000;

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: cookieExpiration,
      path: "/",
    });

    res.status(200).send({ token, admin: admin.user_id });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", { path: "/" });
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      adminId,
    ]);

    if (admin.rows.length === 0) {
      return res.status(404).send({ message: "Admin not found" });
    }

    res.status(200).send(admin.rows[0]);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const authorizeAdmin = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    req.adminId = decoded.adminID;
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(401).send({ message: "Unauthorized" });
  }
};

export const loadOngoingServices = async (req, res) => {
  try {
    const ongoingServices = await pool.query(
      "SELECT * FROM services WHERE status = $1",
      ["ongoing"]
    );

    res.status(200).send(ongoingServices.rows);
  } catch (error) {
    console.error("Error loading ongoing services:", error);
    res.status(500).send("Internal Server Error");
  }
};
export const loadCompletedServices = async (req, res) => {
  try {
    const completedServices = await pool.query(
      "SELECT * FROM services WHERE status = $1",
      ["completed"]
    );

    res.status(200).send(completedServices.rows);
  } catch (error) {
    console.error("Error loading completed services:", error);
    res.status(500).send("Internal Server Error");
  }
};
export const loadPendingServices = async (req, res) => {
  try {
    const pendingServices = await pool.query(
      "SELECT * FROM services WHERE status = $1",
      ["pending"]
    );

    res.status(200).send(pendingServices.rows);
  } catch (error) {
    console.error("Error loading pending services:", error);
    res.status(500).send("Internal Server Error");
  }
};
