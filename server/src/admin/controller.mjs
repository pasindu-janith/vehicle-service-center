import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { decodeToken, tokenGen, tokenGenLogin } from "../utils/jwt.mjs";
import { verifyToken } from "../utils/jwt.mjs";
import { sendEmail } from "../utils/email.mjs";
import dotenv from "dotenv";

// Existing controllers (unchanged)
export const adminLogin = async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password, rememberMe } = req.body;

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

export const authAdmin = async (req, res) => {
  try {
    const { adminToken } = req.cookies;
    if (!adminToken) {
      return res.status(401).send({ message: "No cookies available" });
    }
    const decodedToken = decodeToken(adminToken);
    if (!decodedToken) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const adminID = decodedToken.adminID;
    const checkAdmin = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND user_type_id=$2",
      [adminID, "1"]
    );
    if (checkAdmin.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" });
    }
    res.status(200).send({ message: "Authorized" });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(401).send({ message: "Unauthorized" });
  }
};

// New reset password controller
export const resetAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { adminToken } = req.cookies;

    if (!adminToken) {
      return res
        .status(401)
        .send({ message: "No authentication token provided" });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .send({ message: "Old and new passwords are required" });
    }

    // Verify token and get admin ID
    const decodedToken = decodeToken(adminToken);
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid or expired token" });
    }

    const adminID = decodedToken.adminID;

    // Fetch admin from database
    const checkAdmin = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND user_type_id = $2 AND status = $3",
      [adminID, "1", "1"]
    );

    if (checkAdmin.rows.length === 0) {
      return res.status(400).send({ message: "Admin not found" });
    }

    const admin = checkAdmin.rows[0];

    // Verify old password
    const passwordMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!passwordMatch) {
      return res.status(400).send({ message: "Incorrect old password" });
    }

    // Validate new password (add your own password requirements here)
    if (newPassword.length < 8) {
      return res
        .status(400)
        .send({ message: "New password must be at least 8 characters long" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const updateResult = await pool.query(
      "UPDATE users SET password = $1 WHERE user_id = $2 RETURNING user_id",
      [hashedPassword, adminID]
    );

    if (updateResult.rowCount === 0) {
      return res.status(500).send({ message: "Failed to update password" });
    }

    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Rest of the existing controllers (unchanged)
export const loadOngoingServices = async (req, res) => {
  try {
    const ongoingServices = await pool.query(
      "SELECT * FROM reservations INNER JOIN service_type ON reservations.service_type_id=service_type.service_type_id WHERE reservation_status=(SELECT reservation_status_id FROM reservation_status WHERE status_name=$1) LIMIT 100",
      ["Ongoing"]
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
      `SELECT sr.reservation_id, 
          sr.service_description, 
          sr.service_cost, 
          sr.discount,
          sr.final_amount, 
          st.service_name, 
          v.license_plate,
          vt.vehicle_type,
          vb.vehicle_brand,
          v.model,
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
            INNER JOIN vehicles AS v
            ON r.vehicle_id = v.license_plate
            INNER JOIN vehicle_type AS vt
            ON v.vehicle_type_id = vt.vehicle_type_id
            INNER JOIN vehicle_brand AS vb
            ON v.vehicle_brand_id = vb.vehicle_brand_id
            LEFT JOIN payment_item AS pi 
            ON sr.reservation_id = pi.reservation_id
            WHERE r.reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $1)
            GROUP BY sr.reservation_id, sr.service_description, sr.service_cost, sr.discount, sr.final_amount,
            st.service_name, r.reserve_date, r.start_time, r.end_date, r.end_time, sr.is_paid, v.license_plate, vt.vehicle_type, vb.vehicle_brand, v.model`,
      ["Completed"]
    );
    res.status(200).send(completedServices.rows);
  } catch (error) {
    console.error("Error loading completed services:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const proceedCashPayment = async (req, res) => {
  try {
    const { reservationId, vehicleID, service_cost, discount, final_amount } =
      req.body;

    const updatePayment = await pool.query(
      "UPDATE service_records SET is_paid = true WHERE reservation_id = $1 RETURNING *",
      [reservationId]
    );

    if (updatePayment.rowCount === 0) {
      return res.status(404).send({ message: "Reservation not found" });
    }

    const userID = await pool.query(
      "SELECT user_id FROM vehicles WHERE license_plate = $1",
      [vehicleID]
    );

    const createInvoice = await pool.query(
      "INSERT INTO invoices (reservation_id, customer_id, service_cost, discount, final_amount, created_datetime) VALUES ($1, $2, $3, $4, $5, $6) RETURNING invoice_id",
      [
        reservationId,
        userID.rows[0].user_id,
        service_cost,
        discount,
        final_amount,
        new Date(),
      ]
    );

    const createPayment = await pool.query(
      "INSERT INTO payments (invoice_id, payment_method, transact_amount, transaction_datetime, transaction_status) VALUES ($1, $2, $3, $4, $5)",
      [
        createInvoice.rows[0].invoice_id,
        "CASH",
        final_amount,
        new Date(),
        "SUCCESS",
      ]
    );
    if (createInvoice.rowCount === 0 || createPayment.rowCount === 0) {
      return res
        .status(500)
        .send({ message: "Failed to create payment record" });
    }
    res.status(200).send({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Error processing cash payment:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadServiceTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT service_type_id,service_name FROM service_type"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching vehicle types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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

export const loadPendingServices = async (req, res) => {
  try {
    const pendingServices = await pool.query(
      "SELECT * FROM reservations INNER JOIN service_type ON reservations.service_type_id=service_type.service_type_id WHERE reservation_status=(SELECT reservation_status_id FROM reservation_status WHERE status_name=$1) LIMIT 100",
      ["Pending"]
    );
    res.status(200).send(pendingServices.rows);
  } catch (error) {
    console.error("Error loading pending services:", error);
    res.status(500).send("Internal Server Error");
  }
};

function toSQLDateTime(dateString) {
  const date = new Date(dateString);
  const pad = (n) => (n < 10 ? "0" + n : n);

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`
  );
}

export const loadReservationWithFilter = async (req, res) => {
  const { serviceType, vehicleNumber, startDateTime, endDateTime } = req.query;
  console.log("Filter request received:", req.query);

  const startDateTimeFormatted = toSQLDateTime(startDateTime);
  const endDateTimeFormatted = toSQLDateTime(endDateTime);

  try {
    let query = `
      SELECT * FROM reservations INNER JOIN service_type ON reservations.service_type_id=service_type.service_type_id
      INNER JOIN vehicles ON reservations.vehicle_id=vehicles.license_plate
      INNER JOIN reservation_status ON reservations.reservation_status=reservation_status.reservation_status_id
      WHERE 1=1 
      ${
        serviceType && serviceType != 0
          ? ` AND reservations.service_type_id = '${serviceType}'`
          : ""
      }
      ${
        vehicleNumber && vehicleNumber !== ""
          ? ` AND vehicle_id = '${vehicleNumber}'`
          : ""
      }
      ${
        startDateTime && endDateTime
          ? ` AND (reserve_date + start_time) BETWEEN '${startDateTimeFormatted}'::timestamp AND '${endDateTimeFormatted}'::timestamp`
          : ""
      }
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching ongoing services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loadAllReservations = async (req, res) => {
  try {
    const allReservations = await pool.query(
      `SELECT * FROM reservations INNER JOIN service_type ON reservations.service_type_id=service_type.service_type_id
       INNER JOIN vehicles ON reservations.vehicle_id=vehicles.license_plate 
       INNER JOIN reservation_status ON reservations.reservation_status=reservation_status.reservation_status_id LIMIT 100`
    );
    res.status(200).send(allReservations.rows);
  } catch (error) {
    console.error("Error loading all reservations:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const countReservations = async (req, res) => {
  try {
    const pendingCount = await pool.query(
      "SELECT COUNT(*) FROM reservations WHERE reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $1)",
      ["Pending"]
    );

    const ongoingCount = await pool.query(
      "SELECT COUNT(*) FROM reservations WHERE reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $1)",
      ["Ongoing"]
    );
    const completedCount = await pool.query(
      "SELECT COUNT(*) FROM reservations WHERE reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $1) AND end_date = CURRENT_DATE",
      ["Completed"]
    );
    const pendingCountToday = await pool.query(
      "SELECT COUNT(*) FROM reservations WHERE reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $1) AND reserve_date = CURRENT_DATE",
      ["Pending"]
    );

    const startedCountToday = await pool.query(
      "SELECT COUNT(*) FROM reservations WHERE reservation_status IN (SELECT reservation_status_id FROM reservation_status WHERE status_name IN ('Ongoing','Completed')) AND reserve_date = CURRENT_DATE"
    );

    const registeredUsers = await pool.query(
      "SELECT COUNT(*) FROM users WHERE user_type_id = $1 AND status = $2",
      ["2", "1"]
    );

    res.status(200).json({
      pending: parseInt(pendingCount.rows[0].count),
      ongoing: parseInt(ongoingCount.rows[0].count),
      completed: parseInt(completedCount.rows[0].count),
      pendingToday: parseInt(pendingCountToday.rows[0].count),
      startedToday: parseInt(startedCountToday.rows[0].count),
      registeredUsers: parseInt(registeredUsers.rows[0].count),
    });
  } catch (error) {
    console.error("Error counting reservations:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const startReservation = async (req, res) => {
  try {
    const { reservationId, startDateTime, endDateTime } = req.query;

    if (!reservationId || !startDateTime || !endDateTime) {
      return res.status(400).send({ message: "Missing required fields" });
    }
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    if (startDate >= endDate) {
      return res
        .status(400)
        .send({ message: "Start time must be before end time" });
    }
    const startDateString = toSQLDateTime(startDateTime).split(" ")[0];
    const endDateString = toSQLDateTime(endDateTime).split(" ")[0];
    const startTimeString = toSQLDateTime(startDateTime).split(" ")[1];
    const endTimeString = toSQLDateTime(endDateTime).split(" ")[1];

    const updateReservation = await pool.query(
      "UPDATE reservations SET reserve_date=$1, start_time=$2, end_date=$3, end_time=$4,reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $5) WHERE reservation_id = $6 RETURNING *",
      [
        startDateString,
        startTimeString,
        endDateString,
        endTimeString,
        "Ongoing",
        reservationId,
      ]
    );

    if (updateReservation.rowCount === 0) {
      return res.status(404).send({ message: "Reservation not found" });
    }

    const userEmail = await pool.query(
      `SELECT email FROM users WHERE user_id = (SELECT user_id FROM vehicles WHERE license_plate = 
      (SELECT vehicle_id FROM reservations WHERE reservation_id = $1))`,
      [reservationId]
    );

    const serviceType = await pool.query(
      "SELECT service_name FROM service_type WHERE service_type_id = (SELECT service_type_id FROM reservations WHERE reservation_id = $1)",
      [reservationId]
    );

    if (userEmail.rows.length > 0) {
      const email = userEmail.rows[0].email;
      const emailContent = `
      <!DOCTYPE html>

      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reservation Started</title>

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
          margin-bottom: 18px;
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
      </style>
      </head>
      <body>
      <div class="email-wrapper">

        <div class="header">
          <h1>Reservation Started</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your reservation with ID <strong>${reservationId}</strong> has been started successfully. Below are the details:</p>
          <div class="details">
            <ul>
              <li><strong>Vehicle Number:</strong> ${
                updateReservation.rows[0].vehicle_id
              }</li>
              <li><strong>Service Type:</strong> ${
                serviceType.rows[0].service_name
              }</li>
              <li><strong>Reservation Status:</strong> Ongoing</li>
              <li><strong>Started Date:</strong> ${startDateString}</li>
              <li><strong>Started Time:</strong> ${startTimeString}</li>
              <li><strong>Expected End Date & Time:</strong> ${endDateString}${"  "}${endTimeString}</li>

            </ul>
          </div>
          <p style="text-align: center;">
            <a href="${
              process.env.CLIENT_URL
            }/myaccount/reservation-info/${reservationId}" class="btn">View Reservation Details</a>
          </p>
        </div>
        <div class="footer">
          <p>This email was sent by Shan Automobile and Hybrid Workshop. If you did not make this reservation, please ignore this email.</p>
        </div>
      </div>
      </body>
      </html>
      `;
      await sendEmail(email, "Reservation Started", emailContent);
    }
    res.status(200).send({
      ...updateReservation.rows[0],
      status_name: "Ongoing",
    });
  } catch (error) {
    console.error("Error starting reservation:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const completeReservation = async (req, res) => {
  try {
    const {
      reservationId,
      completedDateTime,
      serviceCost,
      serviceDiscount,
      vehicleNumber,
      notes,
      extraItems = [],
    } = req.body;
    console.log("Complete reservation request received:", req.body);
    const completeDate = toSQLDateTime(completedDateTime).split(" ")[0];
    const completeTime = toSQLDateTime(completedDateTime).split(" ")[1];
    const updateReservation = await pool.query(
      "UPDATE reservations SET reservation_status = (SELECT reservation_status_id FROM reservation_status WHERE status_name = $1), end_date=$2, end_time=$3  WHERE reservation_id = $4 RETURNING *",
      ["Completed", completeDate, completeTime, reservationId]
    );

    if (updateReservation.rowCount === 0) {
      return res.status(404).send({ message: "Reservation not found" });
    }

    const serviceRecord = await pool.query(
      "INSERT INTO service_records (reservation_id, service_description, vehicle_id,service_cost,discount, final_amount,is_paid,created_datetime) VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *",
      [
        reservationId,
        notes || "No description provided",
        vehicleNumber,
        parseFloat(serviceCost) || 0,
        parseFloat(serviceDiscount) || 0,
        parseFloat(serviceCost) - parseFloat(serviceDiscount) || 0,
        false,
        completedDateTime,
      ]
    );

    for (const item of extraItems) {
      if (item.description && item.price) {
        await pool.query(
          `INSERT INTO payment_item (reservation_id, description, price)
           VALUES ($1, $2, $3)`,
          [reservationId, item.description, parseFloat(item.price)]
        );
      }
    }

    const userEmail = await pool.query(
      "SELECT email FROM users WHERE user_id = (SELECT user_id FROM vehicles WHERE license_plate = $1)",
      [vehicleNumber]
    );

    const serviceType = await pool.query(
      "SELECT service_name FROM service_type WHERE service_type_id = (SELECT service_type_id FROM reservations WHERE reservation_id = $1)",
      [reservationId]
    );

    if (userEmail.rows.length > 0) {
      const email = userEmail.rows[0].email;
      const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Completed</title>
        <style>
          body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              color: #333333;
            }

            a {
              color: rgba(255, 255, 255, 1);
              text-decoration: none;
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
              margin-bottom: 18px;
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
              color: #ffffff;
              padding: 12px 24px;
              text-decoration: none;
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
      </style>
      </head>
      <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>Reservation Completed</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your reservation with ID <strong>${reservationId}</strong> has been completed successfully. Below are the details:</p>
          
          <div class="details">
            <ul>
              <li><strong>Vehicle Number:</strong> ${vehicleNumber}</li>
              <li><strong>Service Type:</strong> ${
                serviceType.rows[0].service_name
              }</li>
              <li><strong>Reservation Status:</strong> Completed</li>              
              <li><strong>Service Cost:</strong> ${serviceCost}</li>
              <li><strong>Discount:</strong> ${serviceDiscount}</li>
              <li><strong>Final Amount:</strong> ${
                parseFloat(serviceCost) - parseFloat(serviceDiscount)
              }</li>
              <li><strong>Notes:</strong> ${
                notes || "No description provided"
              }</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${
              process.env.CLIENT_URL
            }/myaccount/proceed-payment?resid=${reservationId}" class="btn">Proceed to Payment</a>
          </p>
          </div>
            <div class="footer">
              <p>This email was sent by Shan Automobile and Hybrid Workshop. If you did not make this reservation, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
    `;
      await sendEmail(email, "Reservation Completed", emailContent);
    }

    res.status(200).send({
      ...updateReservation.rows[0],
      status_name: "Completed",
    });
  } catch (error) {
    console.error("Error completing reservation:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const editReservation = async (req, res) => {
  try {
    const { reservationId, startDateTime, endDateTime } = req.query;

    if (!reservationId || !startDateTime || !endDateTime) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    if (startDate >= endDate) {
      return res
        .status(400)
        .send({ message: "Start time must be before end time" });
    }

    const startDateString = toSQLDateTime(startDateTime).split(" ")[0];
    const endDateString = toSQLDateTime(endDateTime).split(" ")[0];
    const startTimeString = toSQLDateTime(startDateTime).split(" ")[1];
    const endTimeString = toSQLDateTime(endDateTime).split(" ")[1];

    const updateReservation = await pool.query(
      "UPDATE reservations SET reserve_date=$3, start_time=$4, end_date=$5, end_time=$6 WHERE reservation_id = $7 RETURNING *",
      [
        startDateString,
        startTimeString,
        endDateString,
        endTimeString,
        reservationId,
      ]
    );

    if (updateReservation.rowCount === 0) {
      return res.status(404).send({ message: "Reservation not found" });
    }

    res.status(200).send(updateReservation.rows[0]);
  } catch (error) {
    console.error("Error editing reservation:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { reservationID, cancelReason, vehicleNumber } = req.body;

    if (!reservationID) {
      return res.status(400).send({ message: "Reservation ID is required" });
    }

    const checkReservation = await pool.query(
      `SELECT service_name,reserve_date FROM reservations r 
      INNER JOIN service_type st ON r.service_type_id = st.service_type_id
      WHERE r.reservation_id = $1 AND r.vehicle_id = $2`,
      [reservationID, vehicleNumber]
    );

    if (checkReservation.rows.length === 0) {
      return res.status(400).send({ message: "Invalid Reservation ID" });
    }

    const userEmail = await pool.query(
      `SELECT email FROM users WHERE user_id = (SELECT user_id FROM vehicles WHERE license_plate = $1)`,
      [vehicleNumber]
    );
    if (userEmail.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "User not found for this vehicle" });
    }
    const cancelReservation = await pool.query(
      "UPDATE reservations SET reservation_status = $1 WHERE reservation_id=$2",
      ["4", reservationID]
    );

    const resCancelMsg = await pool.query(
      "INSERT INTO reservation_messages (reservation_id, message, role, created_at) VALUES ($1, $2, $3, $4)",
      [reservationID, cancelReason, "1", toSQLDateTime(new Date())]
    );

    if (userEmail.rows.length > 0) {
      const email = userEmail.rows[0].email;

      await sendEmail(
        email,
        "Reservation Cancelled",
        `<!DOCTYPE html>
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

              a {
                color: rgba(255, 255, 255, 1);
                text-decoration: none;
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
                margin-bottom: 18px;
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
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
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
              </style>
            </head>
            <body>
            <div class="email-wrapper">
              <div class="header">
                <h1>Reservation Cancelled</h1>
              </div>
              <div class="content">
                <p>Dear Customer,</p>
                <p>Your reservation with ID <strong>${reservationID}</strong> has been cancelled successfully. Below are the details:</p>
                
                <div class="details">
                  <ul>
                    <li><strong>Vehicle Number:</strong> ${vehicleNumber}</li>
                    <li><strong>Service Type:</strong>${
                      checkReservation.rows[0].service_name
                    }</li>
                    <li><strong>Reservation Date:</strong> ${
                      toSQLDateTime(
                        checkReservation.rows[0].reserve_date
                      ).split(" ")[0]
                    }</li>
                    <li><strong>Reservation Status:</strong> Cancelled</li>
                    <li><strong>Cancelled By:</strong> Admin, Auto Lanka Services</li>
                    <li><strong>Cancellation Date:</strong> ${
                      new Date().toISOString().split("T")[0]
                    }</li>              
                    <li><strong>Cancel Reason:</strong> ${cancelReason}</li>
                  </ul>
                </div>

                <p style="text-align: center;">
                  <a href="${
                    process.env.CLIENT_URL
                  }/myaccount/reservation-info/${reservationID}" class="btn">View Reservation Details</a>
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
    }
    return res.status(200).send({ message: "Reservation cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); // If the token is invalid or the user does not exist, it returns an error message
  }
};

export const loadAllCustomers = async (req, res) => {
  try {
    const allCustomers = await pool.query(
      `SELECT * FROM users AS u 
      INNER JOIN mobile_number m ON u.mobile_id=m.mobile_id 
      INNER JOIN addresses a ON a.address_id=u.address_id WHERE user_type_id = $1 AND status = $2`,
      ["2", "1"]
    );
    res.status(200).send(allCustomers.rows);
  } catch (error) {
    console.error("Error loading all customers:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadCustomerVehicles = async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).send({ message: "Customer ID is required" });
    }

    const vehicles = await pool.query(
      `SELECT * FROM vehicles v
      INNER JOIN vehicle_brand AS vb ON v.vehicle_brand_id = vb.vehicle_brand_id
      INNER JOIN vehicle_type AS vt ON v.vehicle_type_id = vt.vehicle_type_id
      WHERE user_id = $1 AND status = $2`,
      [customerId, "1"]
    );

    if (vehicles.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "No vehicles found for this customer" });
    }

    res.status(200).send(vehicles.rows);
  } catch (error) {
    console.error("Error loading customer vehicles:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadAllVehicles = async (req, res) => {
  try {
    const allVehicles = await pool.query(
      `SELECT * 
      FROM vehicles AS v
      INNER JOIN vehicle_brand AS vb ON v.vehicle_brand_id = vb.vehicle_brand_id
      INNER JOIN vehicle_type AS vt ON v.vehicle_type_id = vt.vehicle_type_id
      INNER JOIN transmission_type AS t ON v.transmission_type = t.transmission_type_id
      INNER JOIN fuel_type AS f ON v.fuel_type = f.fuel_type_id
      WHERE v.status = $1`,
      ["1"]
    );
    res.status(200).send(allVehicles.rows);
  } catch (error) {
    console.error("Error loading all vehicles:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadVehicleInfo = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    if (!vehicleNumber) {
      return res.status(400).send({ message: "Vehicle number is required" });
    }

    const vehicleOwner = await pool.query(
      `SELECT user_id,first_name,last_name,nicno,email,mobile_no,address_line1,address_line2,
      address_line3 FROM users AS u INNER JOIN mobile_number AS m ON u.mobile_id = m.mobile_id
      INNER JOIN addresses AS a ON u.address_id = a.address_id
      WHERE u.user_id = (
        SELECT user_id FROM vehicles WHERE license_plate = $1 AND status = $2
      )`,
      [vehicleNumber, "1"]
    );

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
      [vehicleNumber]
    );

    if (vehicleOwner.rows.length === 0) {
      return res.status(404).send({ message: "Vehicle not found" });
    }

    res.status(200).send({
      vehicleOwner: vehicleOwner.rows[0],
      serviceRecords: serviceRecords.rows,
    });
  } catch (error) {
    console.error("Error loading vehicle info:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const loadNotificationTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT notification_type_id, type_name FROM notification_type"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notification types:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addNotification = async (req, res) => {
  try {
    const { type, message, from, to } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .send({ message: "Title and message are required" });
    }

    const newNotification = await pool.query(
      "INSERT INTO notifications (title, message, link, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, message, link || null, toSQLDateTime(new Date())]
    );

    res.status(201).send(newNotification.rows[0]);
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).send("Internal Server Error");
  }
};
