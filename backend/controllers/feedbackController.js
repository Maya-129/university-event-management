const pool = require("../config/database");


const createFeedback = async (req, res) => {

    try {

        const userId =
            req.session.user.user_id;

        const {
            event_id,
            rating,
            comment
        } = req.body;


        if (!event_id || !rating) {

            return res.status(400).json({
                success: false,
                message:
                    "Event and rating are required."
            });

        }


        const numericRating =
            Number(rating);


        if (
            numericRating < 1 ||
            numericRating > 5
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Rating must be between 1 and 5."
            });

        }


        const registration =
            await pool.query(
                `SELECT registration_id
                 FROM registrations
                 WHERE user_id = $1
                 AND event_id = $2
                 AND status = 'registered'`,
                [
                    userId,
                    Number(event_id)
                ]
            );


        if (registration.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message:
                    "You must be registered for this event."
            });

        }


        const existing =
            await pool.query(
                `SELECT feedback_id
                 FROM feedback
                 WHERE user_id = $1
                 AND event_id = $2`,
                [
                    userId,
                    Number(event_id)
                ]
            );


        if (existing.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message:
                    "You have already submitted feedback."
            });

        }


        await pool.query(
            `INSERT INTO feedback
            (
                event_id,
                user_id,
                rating,
                comment
            )
            VALUES ($1, $2, $3, $4)`,
            [
                Number(event_id),
                userId,
                numericRating,
                comment || null
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Feedback submitted successfully."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to submit feedback."
        });

    }
};



const getMyFeedback = async (req, res) => {

    try {

        const userId =
            req.session.user.user_id;


        const result = await pool.query(
            `SELECT
                f.feedback_id,
                f.rating,
                f.comment,
                f.created_at,
                e.event_id,
                e.title

             FROM feedback f

             JOIN events e
             ON f.event_id = e.event_id

             WHERE f.user_id = $1

             ORDER BY f.created_at DESC`,
            [userId]
        );


        res.json({
            success: true,
            feedback:
                result.rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to load feedback."
        });

    }
};



const getEventFeedback = async (req, res) => {

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
                f.feedback_id,
                f.rating,
                f.comment,
                f.created_at,
                u.name,
                u.email

             FROM feedback f

             JOIN users u
             ON f.user_id = u.user_id

             WHERE f.event_id = $1

             ORDER BY f.created_at DESC`,
            [eventId]
        );


        const summary =
            await pool.query(
                `SELECT
                    COUNT(*) AS total_feedback,
                    COALESCE(
                        ROUND(
                            AVG(rating)::numeric,
                            2
                        ),
                        0
                    ) AS average_rating

                 FROM feedback

                 WHERE event_id = $1`,
                [eventId]
            );


        res.json({
            success: true,
            feedback:
                result.rows,
            summary:
                summary.rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to load event feedback."
        });

    }
};


module.exports = {
    createFeedback,
    getMyFeedback,
    getEventFeedback
};