const express = require("express");

const {
    registerForEvent,
    getMyRegistrations,
    cancelRegistration
} = require("../controllers/registrationController");

const {
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
    "/",
    requireRole("student"),
    registerForEvent
);


router.get(
    "/my",
    requireRole("student"),
    getMyRegistrations
);


router.delete(
    "/:id",
    requireRole("student"),
    cancelRegistration
);


module.exports = router;