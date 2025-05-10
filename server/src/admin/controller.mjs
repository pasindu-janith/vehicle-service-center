import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { tokenGenLogin } from "../utils/jwt.mjs";

// Admin login controller
export const adminLogin = async (req, res) => {
    try {
      
      console.log("Login request received:", req.body);
      const { email, password } = req.body; //
      
      const checkAdmin = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND status = $2 AND user_type_id = $3",
        [email, "1", "1"]
      );
      
      if (checkAdmin.rows.length === 0) {        //
        return res.status(400).send({ message: "Invalid admin credentials" });
      }
  
      const admin = checkAdmin.rows[0];
      const passwordMatch = await bcrypt.compare(password, admin.password);
      
      if (!passwordMatch) {
        return res.status(400).send({ message: "Invalid credentials" });
      }
  
      const token = tokenGenLogin({ adminID: admin.user_id, email: admin.email });
      const cookieExpiration =  24 * 60 * 60 * 1000;
  
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: cookieExpiration,
        path: "/",
      });
  
     
      res.status(200).send({ token, admin: admin.user_id });
    }  catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
  };
