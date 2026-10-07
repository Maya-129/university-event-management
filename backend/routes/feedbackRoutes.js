const express = require("express");

const {
    createFeedback,
    getMyFeedback,
    getEventFeedback
} = require("../controllers/feedbackController");

const {
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
    "/",
    requireRole("student"),
    createFeedback
);


router.get(
    "/my",
    requireRole("student"),
    getMyFeedback
);


router.get(
    "/event/:eventId",
    requireRole("organizer"),
    getEventFeedback
);


module.exports = router;