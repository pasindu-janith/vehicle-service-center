import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  // host: "vscdatabase.cxaogewmsid6.ap-south-1.rds.amazonaws.com",43.205.5.82
  host: "43.205.5.82",
  user: "postgres",
  database: "service-center",
  password: "Vehicle12345",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
