import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ 
    user: 'postgres',
    host: 'localhost',
    database: 'service-center',
    password: 'abc123',
    port: 3306,
});

export default pool;