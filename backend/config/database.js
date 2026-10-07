const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});

pool.on("connect", () => {
    console.log("PostgreSQL database connected.");
});

pool.on("error", (error) => {
    console.error("PostgreSQL error:", error.message);
});

async function testDatabase() {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        console.log(
            "Database test successful:",
            result.rows[0].current_time
        );
    } catch (error) {
        console.error(
            "Database connection failed:",
            error.message
        );
    }
}

testDatabase();

module.exports = pool;