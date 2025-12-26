const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel");

// controllers/authController.js
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Auth.findByUsername(username);
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Include full_name in payload (center_id removed)
    const payload = {
      id: user.id,
      username: user.username,
      user_type: user.user_type,
      full_name: `${user.name || ''} ${user.surname || ''}`.trim(),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // Include additional user info for localStorage
    const userInfo = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      id_number: user.id_number,
      user_type: user.user_type,
      username: user.username,
    };

    res.json({ token, user: payload, userInfo });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, surname, username, password, confirmPassword } = req.body;

  try {
    // Validation
    if (!name || !surname || !username || !password || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // Check username uniqueness
    const usernameExists = await Auth.checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user with user_type_id = 6 (Imam User)
    const newUser = await Auth.create({
      name,
      surname,
      username,
      password_hash,
      user_type_id: 6,
    });

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        surname: newUser.surname,
        username: newUser.username,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    
    // Handle unique constraint violation
    if (err.code === '23505' || err.message.includes('unique')) {
      return res.status(400).json({ msg: "Username already exists" });
    }
    
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
