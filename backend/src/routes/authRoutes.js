// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passwordResetController = require("../controllers/passwordResetController");

router.post("/login", authController.login);
router.post("/register", authController.register);

// Password reset routes
router.post("/password-reset/request", passwordResetController.requestPasswordReset);
router.get("/password-reset/verify/:token", passwordResetController.verifyResetToken);
router.post("/password-reset/reset", passwordResetController.resetPassword);

module.exports = router;
