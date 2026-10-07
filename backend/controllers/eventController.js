const pool = require("../config/database");


const createEvent = async (req, res) => {

    try {

        const organizerId =
            req.session.user.user_id;

        const {
            title,
            description,
            category,
            event_date,
            start_time,
            end_time,
            venue,
            capacity,
            registration_deadline,
            organization_id,
            image_url
        } = req.body;


        if (
            !title ||
            !description ||
            !category ||
            !event_date ||
            !start_time ||
            !venue ||
            !capacity
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields."
            });

        }


        const result = await pool.query(
            `INSERT INTO events
            (
                title,
                description,
                category,
                event_date,
                start_time,
                end_time,
                venue,
                capacity,
                registration_deadline,
                organizer_id,
                organization_id,
                image_url
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,
                $9,$10,$11,$12
            )
            RETURNING event_id`,
            [
                title,
                description,
                category,
                event_date,
                start_time,
                end_time || null,
                venue,
                Number(capacity),
                registration_deadline || null,
                organizerId,
                organization_id
                    ? Number(organization_id)
                    : null,
                image_url || null
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Event created successfully.",
            event_id:
                result.rows[0].event_id
        });


    } catch (error) {

        console.error(
            "Create event error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create event."
        });

    }
};



const getApprovedEvents = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT
                e.*,
                u.name AS organizer_name,
                o.name AS organization_name,

                (
                    SELECT COUNT(*)
                    FROM registrations r
                    WHERE r.event_id = e.event_id
                    AND r.status = 'registered'
                ) AS registered_count

             FROM events e

             JOIN users u
             ON e.organizer_id = u.user_id

             LEFT JOIN organizations o
             ON e.organization_id = o.organization_id

             WHERE e.status IN ('approved', 'completed')

             ORDER BY e.event_date ASC`
        );


        res.json({
            success: true,
            events: result.rows
        });


    } catch (error) {

        console.error(
            "Get events error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load events."
        });

    }
};



const getEventById = async (req, res) => {

    try {

        const eventId = Number(req.params.id);


        const result = await pool.query(
            `SELECT
                e.*,
                u.name AS organizer_name,
                u.email AS organizer_email,
                o.name AS organization_name,

                (
                    SELECT COUNT(*)
                    FROM registrations r
                    WHERE r.event_id = e.event_id
                    AND r.status = 'registered'
                ) AS registered_count

             FROM events e

             JOIN users u
             ON e.organizer_id = u.user_id

             LEFT JOIN organizations o
             ON e.organization_id = o.organization_id

             WHERE e.event_id = $1`,
            [eventId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Event not found."
            });

        }


        res.json({
            success: true,
            event: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Get event error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load event."
        });

    }
};



const getOrganizerEvents = async (req, res) => {

    try {

        const organizerId =
            req.session.user.user_id;


        const result = await pool.query(
            `SELECT
                e.*,

                (
                    SELECT COUNT(*)
                    FROM registrations r
                    WHERE r.event_id = e.event_id
                    AND r.status = 'registered'
                ) AS registered_count

             FROM events e

             WHERE e.organizer_id = $1

             ORDER BY e.created_at DESC`,
            [organizerId]
        );


        res.json({
            success: true,
            events: result.rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to load your events."
        });

    }
};



const updateEvent = async (req, res) => {

    try {

        const eventId =
            Number(req.params.id);

        const organizerId =
            req.session.user.user_id;


        const {
            title,
            description,
            category,
            event_date,
            start_time,
            end_time,
            venue,
            capacity,
            registration_deadline,
            organization_id,
            image_url
        } = req.body;


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


        await pool.query(
            `UPDATE events
             SET
                title = $1,
                description = $2,
                category = $3,
                event_date = $4,
                start_time = $5,
                end_time = $6,
                venue = $7,
                capacity = $8,
                registration_deadline = $9,
                organization_id = $10,
                image_url = $11

             WHERE event_id = $12`,
            [
                title,
                description,
                category,
                event_date,
                start_time,
                end_time || null,
                venue,
                Number(capacity),
                registration_deadline || null,
                organization_id
                    ? Number(organization_id)
                    : null,
                image_url || null,
                eventId
            ]
        );


        res.json({
            success: true,
            message:
                "Event updated successfully."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to update event."
        });

    }
};



const deleteEvent = async (req, res) => {

    try {

        const eventId =
            Number(req.params.id);

        const organizerId =
            req.session.user.user_id;


        const result = await pool.query(
            `DELETE FROM events
             WHERE event_id = $1
             AND organizer_id = $2`,
            [
                eventId,
                organizerId
            ]
        );


        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Event not found or you do not own it."
            });

        }


        res.json({
            success: true,
            message:
                "Event deleted successfully."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to delete event."
        });

    }
};


module.exports = {
    createEvent,
    getApprovedEvents,
    getEventById,
    getOrganizerEvents,
    updateEvent,
    deleteEvent
};