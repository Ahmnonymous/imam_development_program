// models/authModel.js
const pool = require("../config/db");

const Auth = {
  findByUsername: async (username) => {
    const res = await pool.query(
      "SELECT * FROM Employee WHERE Username=$1",
      [username]
    );
    return res.rows[0];
  },

  checkUsernameExists: async (username) => {
    const res = await pool.query(
      "SELECT COUNT(*) as count FROM Employee WHERE Username=$1",
      [username]
    );
    return parseInt(res.rows[0].count) > 0;
  },

  create: async (userData) => {
    const {
      name,
      surname,
      username,
      password_hash,
      user_type_id = 6, // Default to "Imam User"
    } = userData;

    const res = await pool.query(
      `INSERT INTO Employee (Name, Surname, Username, Password_Hash, User_Type, Created_By, Updated_By)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, surname, username, user_type`,
      [name, surname, username, password_hash, user_type_id, username, username]
    );
    return res.rows[0];
  },
};

module.exports = Auth;
