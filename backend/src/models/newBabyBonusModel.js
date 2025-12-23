const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
} = require("../utils/modelHelpers");

const tableName = "New_Baby_Bonus";

const newBabyBonusModel = {
  getAll: async (imamProfileId = null) => {
    try {
      let query = `SELECT * FROM ${tableName}`;
      const params = [];
      
      if (imamProfileId) {
        query += ` WHERE imam_profile_id = $1`;
        params.push(imamProfileId);
      }
      
      query += ` ORDER BY id DESC`;

      const res = await pool.query(query, params);
      res.rows = res.rows.map((row) => {
        if (row.Baby_Image && row.Baby_Image_Filename) {
          row.Baby_Image = "exists";
        } else if (row.Baby_Image) {
          row.Baby_Image = row.Baby_Image.toString("base64");
        }
        if (row.Birth_Certificate && row.Birth_Certificate_Filename) {
          row.Birth_Certificate = "exists";
        } else if (row.Birth_Certificate) {
          row.Birth_Certificate = row.Birth_Certificate.toString("base64");
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
      if (row.Baby_Image && row.Baby_Image_Filename) {
        row.Baby_Image = "exists";
      } else if (row.Baby_Image) {
        row.Baby_Image = row.Baby_Image.toString("base64");
      }
      if (row.Birth_Certificate && row.Birth_Certificate_Filename) {
        row.Birth_Certificate = "exists";
      } else if (row.Birth_Certificate) {
        row.Birth_Certificate = row.Birth_Certificate.toString("base64");
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

module.exports = newBabyBonusModel;

