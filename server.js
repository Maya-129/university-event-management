const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

require("./backend/config/database");

const authRoutes =
    require("./backend/routes/authRoutes");

const eventRoutes =
    require("./backend/routes/eventRoutes");

const registrationRoutes =
    require("./backend/routes/registrationRoutes");

const attendanceRoutes =
    require("./backend/routes/attendanceRoutes");

const feedbackRoutes =
    require("./backend/routes/feedbackRoutes");


const app = express();

const PORT =
    process.env.PORT || 3000;


app.use(cors());


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "university-event-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge:
                1000 * 60 * 60 * 24
        }
    })
);


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/events",
    eventRoutes
);


app.use(
    "/api/registrations",
    registrationRoutes
);


app.use(
    "/api/attendance",
    attendanceRoutes
);


app.use(
    "/api/feedback",
    feedbackRoutes
);


app.use(
    express.static(
        path.join(
            __dirname,
            "frontend"
        )
    )
);


app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "frontend",
            "index.html"
        )
    );

});


app.get(
    "/api/test",
    (req, res) => {

        res.json({
            success: true,
            message:
                "University Event Management System API is working."
        });

    }
);


app.get(
    "/api/db-test",
    async (req, res) => {

        try {

            const pool =
                require("./backend/config/database");

            const result =
                await pool.query(
                    "SELECT NOW() AS current_time"
                );


            res.json({
                success: true,
                message:
                    "PostgreSQL database connected successfully.",
                time:
                    result.rows[0].current_time
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "PostgreSQL connection failed."
            });

        }

    }
);


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);