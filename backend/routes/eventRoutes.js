const express = require("express");

const {
    createEvent,
    getApprovedEvents,
    getEventById,
    getOrganizerEvents,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");

const {
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();


router.get(
    "/",
    getApprovedEvents
);


router.get(
    "/organizer/my-events",
    requireRole("organizer"),
    getOrganizerEvents
);


router.post(
    "/",
    requireRole("organizer"),
    createEvent
);


router.put(
    "/:id",
    requireRole("organizer"),
    updateEvent
);


router.delete(
    "/:id",
    requireRole("organizer"),
    deleteEvent
);


router.get(
    "/:id",
    getEventById
);


module.exports = router;