const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
} = require("../utils/modelHelpers");

const tableName = "tickets";

const ticketsModel = {
  getAll: async () => {
    try {
      const query = `SELECT * FROM ${tableName} ORDER BY id DESC`;
      const res = await pool.query(query);
      res.rows = res.rows.map((row) => {
        // Map database column names to frontend field names
        if (row.classification_id !== undefined) {
          row.classification = row.classification_id;
        }
        if (row.status_id !== undefined) {
          row.status = row.status_id;
        }
        if (row.created_at !== undefined) {
          row.created_time = row.created_at;
        }
        if (row.closed_at !== undefined) {
          row.closed_time = row.closed_at;
        }
        if (row.media && row.media_filename) {
          row.media = "exists";
        } else if (row.media) {
          row.media = row.media.toString("base64");
        }
        return row;
      });
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
      const row = res.rows[0];
      // Map database column names to frontend field names
      if (row.classification_id !== undefined) {
        row.classification = row.classification_id;
      }
      if (row.status_id !== undefined) {
        row.status = row.status_id;
      }
      if (row.created_at !== undefined) {
        row.created_time = row.created_at;
      }
      if (row.closed_at !== undefined) {
        row.closed_time = row.closed_at;
      }
      if (row.media && row.media_filename) {
        row.media = "exists";
      } else if (row.media) {
        row.media = row.media.toString("base64");
      }
      return row;
    } catch (err) {
      throw new Error(
        `Error fetching record by ID from ${tableName}: ${err.message}`,
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
      const row = res.rows[0];
      // Map database column names to frontend field names
      if (row.classification_id !== undefined) {
        row.classification = row.classification_id;
      }
      return row;
    } catch (err) {
      throw new Error(`Error creating record in ${tableName}: ${err.message}`);
    }
  },

  update: async (id, fields) => {
    try {
      const { setClause, values } = buildUpdateFragments(fields, {
        quote: false,
      });
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ${
        values.length + 1
      } RETURNING *`;
      const res = await pool.query(query, [...values, id]);
      if (res.rowCount === 0) return null;
      const row = res.rows[0];
      // Map database column names to frontend field names
      if (row.classification_id !== undefined) {
        row.classification = row.classification_id;
      }
      return row;
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

module.exports = ticketsModel;

