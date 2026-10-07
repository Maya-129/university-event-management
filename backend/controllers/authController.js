const bcrypt = require("bcrypt");
const pool = require("../config/database");


const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            department,
            phone
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters."
            });

        }


        const existing = await pool.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
        );


        if (existing.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message:
                    "This email is already registered."
            });

        }


        let userRole = role || "student";


        if (
            userRole !== "student" &&
            userRole !== "organizer"
        ) {
            userRole = "student";
        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const result = await pool.query(
            `INSERT INTO users
            (
                name,
                email,
                password,
                role,
                department,
                phone
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, name, email, role,
                      department, phone`,
            [
                name,
                email,
                hashedPassword,
                userRole,
                department || null,
                phone || null
            ]
        );


        res.status(201).json({
            success: true,
            message: "Registration successful.",
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error during registration."
        });

    }
};



const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });

        }


        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });

        }


        const user = result.rows[0];


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });

        }


        req.session.user = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        };


        res.json({
            success: true,
            message: "Login successful.",
            user: req.session.user
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error during login."
        });

    }
};



const logoutUser = (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });

        }


        res.json({
            success: true,
            message: "Logout successful."
        });

    });

};



const getCurrentUser = (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            success: false,
            message: "You are not logged in."
        });

    }


    res.json({
        success: true,
        user: req.session.user
    });

};


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
};