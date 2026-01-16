// models/passwordResetModel.js
const pool = require("../config/db");
const crypto = require("crypto");

const PasswordReset = {
  /**
   * Find user by email (checks both Employee and Imam_Profiles)
   */
  findByEmail: async (email) => {
    try {
      // First check Imam_Profiles (most common case)
      const imamRes = await pool.query(
        `SELECT ip.email, ip.employee_id, e.id, e.username, e.name, e.surname
         FROM Imam_Profiles ip
         INNER JOIN Employee e ON ip.employee_id = e.id
         WHERE LOWER(ip.email) = LOWER($1)`,
        [email]
      );
      
      if (imamRes.rows.length > 0) {
        return {
          employee_id: imamRes.rows[0].employee_id,
          email: imamRes.rows[0].email,
          username: imamRes.rows[0].username,
          name: imamRes.rows[0].name,
          surname: imamRes.rows[0].surname,
        };
      }
      
      // If not found in Imam_Profiles, check if Employee table has email column
      // Note: Employee table might not have email column, so we'll skip this for now
      // and rely on Imam_Profiles
      
      return null;
    } catch (err) {
      console.error("Error finding user by email:", err);
      throw err;
    }
  },

  /**
   * Create a password reset token
   */
  createToken: async (email, employeeId) => {
    try {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");
      
      // Token expires in 15 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      // Delete any existing unused tokens for this email
      await pool.query(
        "DELETE FROM Password_Reset_Tokens WHERE email = $1 AND used = false",
        [email]
      );
      
      // Insert new token
      const res = await pool.query(
        `INSERT INTO Password_Reset_Tokens (email, token, employee_id, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, token, expires_at, created_at`,
        [email, token, employeeId, expiresAt]
      );
      
      return res.rows[0];
    } catch (err) {
      console.error("Error creating password reset token:", err);
      throw err;
    }
  },

  /**
   * Find token by token string
   */
  findByToken: async (token) => {
    try {
      const res = await pool.query(
        `SELECT prt.*, e.id as employee_id, e.username
         FROM Password_Reset_Tokens prt
         LEFT JOIN Employee e ON prt.employee_id = e.id
         WHERE prt.token = $1`,
        [token]
      );
      
      return res.rows[0] || null;
    } catch (err) {
      console.error("Error finding token:", err);
      throw err;
    }
  },

  /**
   * Mark token as used
   */
  markAsUsed: async (token) => {
    try {
      await pool.query(
        "UPDATE Password_Reset_Tokens SET used = true WHERE token = $1",
        [token]
      );
    } catch (err) {
      console.error("Error marking token as used:", err);
      throw err;
    }
  },

  /**
   * Check if there's an active (unused and not expired) token for email
   */
  hasActiveToken: async (email) => {
    try {
      const res = await pool.query(
        `SELECT id FROM Password_Reset_Tokens
         WHERE email = $1 
         AND used = false 
         AND expires_at > NOW()`,
        [email]
      );
      
      return res.rows.length > 0;
    } catch (err) {
      console.error("Error checking active token:", err);
      throw err;
    }
  },

  /**
   * Update user password
   */
  updatePassword: async (employeeId, newPasswordHash) => {
    try {
      await pool.query(
        "UPDATE Employee SET Password_Hash = $1, Updated_At = NOW() WHERE id = $2",
        [newPasswordHash, employeeId]
      );
    } catch (err) {
      console.error("Error updating password:", err);
      throw err;
    }
  },
};

module.exports = PasswordReset;

