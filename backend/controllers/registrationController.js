const pool = require("../config/database");


const registerForEvent = async (req, res) => {

    try {

        const userId =
            req.session.user.user_id;

        const eventId =
            Number(req.body.event_id);


        if (!eventId) {

            return res.status(400).json({
                success: false,
                message:
                    "Event ID is required."
            });

        }


        const eventResult = await pool.query(
            `SELECT
                event_id,
                capacity,
                registration_deadline,
                status,

                (
                    SELECT COUNT(*)
                    FROM registrations r
                    WHERE r.event_id = events.event_id
                    AND r.status = 'registered'
                ) AS registered_count

             FROM events

             WHERE event_id = $1`,
            [eventId]
        );


        if (eventResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Event not found."
            });

        }


        const event = eventResult.rows[0];


        if (event.status !== "approved") {

            return res.status(400).json({
                success: false,
                message:
                    "Registration is not available."
            });

        }


        if (
            event.registration_deadline &&
            new Date(event.registration_deadline) <
                new Date()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Registration deadline has passed."
            });

        }


        if (
            Number(event.registered_count) >=
            Number(event.capacity)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "This event is full."
            });

        }


        const existing =
            await pool.query(
                `SELECT *
                 FROM registrations
                 WHERE user_id = $1
                 AND event_id = $2`,
                [
                    userId,
                    eventId
                ]
            );


        if (existing.rows.length > 0) {

            const registration =
                existing.rows[0];


            if (
                registration.status ===
                "registered"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "You are already registered."
                });

            }


            await pool.query(
                `UPDATE registrations
                 SET
                    status = 'registered',
                    registration_date =
                        CURRENT_TIMESTAMP
                 WHERE registration_id = $1`,
                [registration.registration_id]
            );


            return res.json({
                success: true,
                message:
                    "Registration successful again."
            });

        }


        await pool.query(
            `INSERT INTO registrations
            (
                user_id,
                event_id,
                status
            )
            VALUES
            ($1, $2, 'registered')`,
            [
                userId,
                eventId
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Event registration successful."
        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Registration failed."
        });

    }
};



const getMyRegistrations = async (req, res) => {

    try {

        const userId =
            req.session.user.user_id;


        const result = await pool.query(
            `SELECT
                r.registration_id,
                r.registration_date,
                r.status,

                e.event_id,
                e.title,
                e.description,
                e.category,
                e.event_date,
                e.start_time,
                e.end_time,
                e.venue

             FROM registrations r

             JOIN events e
             ON r.event_id = e.event_id

             WHERE r.user_id = $1

             ORDER BY
                e.event_date ASC`,
            [userId]
        );


        res.json({
            success: true,
            registrations:
                result.rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to load registrations."
        });

    }
};



const cancelRegistration = async (req, res) => {

    try {

        const registrationId =
            Number(req.params.id);

        const userId =
            req.session.user.user_id;


        const result = await pool.query(
            `UPDATE registrations
             SET status = 'cancelled'

             WHERE registration_id = $1
             AND user_id = $2
             AND status = 'registered'`,
            [
                registrationId,
                userId
            ]
        );


        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Registration not found."
            });

        }


        res.json({
            success: true,
            message:
                "Registration cancelled."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to cancel registration."
        });

    }
};


module.exports = {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration
};