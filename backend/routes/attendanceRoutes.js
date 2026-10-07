const express = require("express");

const {
    getEventParticipants,
    markAttendance
} = require("../controllers/attendanceController");

const {
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();


router.get(
    "/event/:eventId",
    requireRole("organizer"),
    getEventParticipants
);


router.post(
    "/event/:eventId",
    requireRole("organizer"),
    markAttendance
);


module.exports = router;