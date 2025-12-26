const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
} = require("../utils/modelHelpers");

const tableName = "Imam_Profiles";

const imamProfilesModel = {
  getAll: async () => {
    try {
      const query = `SELECT * FROM ${tableName} ORDER BY id DESC`;
      const res = await pool.query(query);
      return res.rows;
    } catch (err) {
      throw new Error(
        `Error fetching all records from ${tableName}: ${err.message}`,
      );
    }
  },

  getById: async (id) => {
    try {
      const query = `SELECT * FROM ${tableName} WHERE id = $1`;
      const res = await pool.query(query, [id]);
      if (!res.rows[0]) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error fetching record by ID from ${tableName}: ${err.message}`,
      );
    }
  },

  getByUsername: async (username) => {
    try {
      const query = `SELECT ip.* FROM ${tableName} ip 
                     INNER JOIN Employee e ON ip.employee_id = e.ID 
                     WHERE e.Username = $1 
                     ORDER BY ip.id DESC 
                     LIMIT 1`;
      const res = await pool.query(query, [username]);
      if (!res.rows[0]) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error fetching record by username from ${tableName}: ${err.message}`,
      );
    }
  },

  getByEmployeeId: async (employeeId) => {
    try {
      const query = `SELECT * FROM ${tableName} WHERE employee_id = $1 LIMIT 1`;
      const res = await pool.query(query, [employeeId]);
      if (!res.rows[0]) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error fetching record by employee_id from ${tableName}: ${err.message}`,
      );
    }
  },

  create: async (fields) => {
    try {
      const { columns, values, placeholders } = buildInsertFragments(fields, {
        quote: false,
      });
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      throw new Error(`Error creating record in ${tableName}: ${err.message}`);
    }
  },

  update: async (id, fields) => {
    try {
      const { setClause, values } = buildUpdateFragments(fields, {
        quote: false,
      });
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${
        values.length + 1
      } RETURNING *`;
      const res = await pool.query(query, [...values, id]);
      if (res.rowCount === 0) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error updating record in ${tableName}: ${err.message}`,
      );
    }
  },

  delete: async (id) => {
    try {
      const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
      const res = await pool.query(query, [id]);
      if (res.rowCount === 0) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error deleting record from ${tableName}: ${err.message}`,
      );
    }
  },
};

module.exports = imamProfilesModel;

