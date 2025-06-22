import bcrypt from "bcrypt";
import pool from "../../db.mjs";
import { decodeToken, tokenGen, tokenGenLogin } from "../utils/jwt.mjs";
import { verifyToken } from "../utils/jwt.mjs";
import { sendEmail } from "../utils/email.mjs";
import dotenv from "dotenv";

// Admin login controller
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
      return res.status(401).send({ message: "No cookies available" }); // This function checks if the user is authorized by verifying the token in the cookies
    }
    const decodedToken = decodeToken(adminToken);
    if (!decodedToken) {
      return res.status(401).send({ message: "Unauthorized" }); // It returns a 401 status if the token is not present or invalid, and a 200 status if the user is authorized
    }
    const adminID = decodedToken.adminID;
    const checkAdmin = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND user_type_id=$2",
      [adminID, "1"]
    );
    if (checkAdmin.rows.length === 0) {
      return res.status(400).send({ message: "Invalid User" }); // It also checks if the user exists in the database and returns a 400 status if not
    }
    res.status(200).send({ message: "Authorized" });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(401).send({ message: "Unauthorized" });
  }
};

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
      "SELECT * FROM reservations INNER JOIN reservation_status ON reservations.reservation_status=reservation_status.reservation_status_id WHERE status_name=$1 LIMIT 100",
      ["Completed"]
    );

    res.status(200).send(completedServices.rows);
  } catch (error) {
    console.error("Error loading completed services:", error);
    res.status(500).send("Internal Server Error");
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
    // Update the reservation to "Ongoing" status
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
        false, // Assuming the service is not paid at this point
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
