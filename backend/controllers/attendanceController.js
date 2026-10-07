const pool = require("../config/database");


const getEventParticipants = async (req, res) => {

    try {

        const eventId =
            Number(req.params.eventId);

        const organizerId =
            req.session.user.user_id;


        const owner = await pool.query(
            `SELECT event_id
             FROM events
             WHERE event_id = $1
             AND organizer_id = $2`,
            [
                eventId,
                organizerId
            ]
        );


        if (owner.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message:
                    "You do not own this event."
            });

        }


        const result = await pool.query(
            `SELECT
                r.registration_id,
                u.user_id,
                u.name,
                u.email,
                u.department,

                COALESCE(
                    a.attendance_status,
                    'absent'
                ) AS attendance_status

             FROM registrations r

             JOIN users u
             ON r.user_id = u.user_id

             LEFT JOIN attendance a
             ON a.event_id = r.event_id
             AND a.user_id = r.user_id

             WHERE r.event_id = $1
             AND r.status = 'registered'

             ORDER BY u.name`,
            [eventId]
        );


        res.json({
            success: true,
            participants:
                result.rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to load participants."
        });

    }
};



const markAttendance = async (req, res) => {

    try {

        const eventId =
            Number(req.params.eventId);

        const {
            user_id,
            attendance_status
        } = req.body;

        const organizerId =
            req.session.user.user_id;


        if (
            !user_id ||
            !["present", "absent"]
                .includes(attendance_status)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance data."
            });

        }


        const owner = await pool.query(
            `SELECT event_id
             FROM events
             WHERE event_id = $1
             AND organizer_id = $2`,
            [
                eventId,
                organizerId
            ]
        );


        if (owner.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message:
                    "You do not own this event."
            });

        }


        const registered =
            await pool.query(
                `SELECT registration_id
                 FROM registrations
                 WHERE event_id = $1
                 AND user_id = $2
                 AND status = 'registered'`,
                [
                    eventId,
                    user_id
                ]
            );


        if (registered.rows.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Student is not registered."
            });

        }


        await pool.query(
            `INSERT INTO attendance
            (
                event_id,
                user_id,
                attendance_status
            )
            VALUES ($1, $2, $3)

            ON CONFLICT (event_id, user_id)

            DO UPDATE SET
                attendance_status =
                    EXCLUDED.attendance_status,
                marked_at =
                    CURRENT_TIMESTAMP`,
            [
                eventId,
                user_id,
                attendance_status
            ]
        );


        res.json({
            success: true,
            message:
                "Attendance updated."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to update attendance."
        });

    }
};


module.exports = {
    getEventParticipants,
    markAttendance
};