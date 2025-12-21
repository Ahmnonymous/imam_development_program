const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
} = require("../utils/modelHelpers");

const tableName = "Medical_Reimbursement";

const medicalReimbursementModel = {
  getAll: async (centerId = null, isSuperAdmin = false, imamProfileId = null) => {
    try {
      let query = `SELECT * FROM ${tableName}`;
      const params = [];
      
      if (imamProfileId) {
        query += ` WHERE imam_profile_id = $${params.length + 1}`;
        params.push(imamProfileId);
      }
      
      const scoped = scopeQuery(
        { text: query, values: params },
        { centerId, isSuperAdmin, column: "center_id" },
      );

      const res = await pool.query(scoped.text, scoped.values);
      res.rows = res.rows.map((row) => {
        if (row.Receipt && row.Receipt_Filename) {
          row.Receipt = "exists";
        } else if (row.Receipt) {
          row.Receipt = row.Receipt.toString("base64");
        }
        if (row.Supporting_Docs && row.Supporting_Docs_Filename) {
          row.Supporting_Docs = "exists";
        } else if (row.Supporting_Docs) {
          row.Supporting_Docs = row.Supporting_Docs.toString("base64");
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

  getById: async (id, centerId = null, isSuperAdmin = false) => {
    try {
      const scoped = scopeQuery(
        {
          text: `SELECT * FROM ${tableName} WHERE id = $1`,
          values: [id],
        },
        { centerId, isSuperAdmin, column: "center_id" },
      );

      const res = await pool.query(scoped.text, scoped.values);
      if (!res.rows[0]) return null;
      const row = res.rows[0];
      if (row.Receipt && row.Receipt_Filename) {
        row.Receipt = "exists";
      } else if (row.Receipt) {
        row.Receipt = row.Receipt.toString("base64");
      }
      if (row.Supporting_Docs && row.Supporting_Docs_Filename) {
        row.Supporting_Docs = "exists";
      } else if (row.Supporting_Docs) {
        row.Supporting_Docs = row.Supporting_Docs.toString("base64");
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

  update: async (id, fields, centerId = null, isSuperAdmin = false) => {
    try {
      const { setClause, values } = buildUpdateFragments(fields, {
        quote: false,
      });
      const scoped = scopeQuery(
        {
          text: `UPDATE ${tableName} SET ${setClause} WHERE id = $${
            values.length + 1
          } RETURNING *`,
          values: [...values, id],
        },
        { centerId, isSuperAdmin, column: "center_id" },
      );

      const res = await pool.query(scoped.text, scoped.values);
      if (res.rowCount === 0) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error updating record in ${tableName}: ${err.message}`,
      );
    }
  },

  delete: async (id, centerId = null, isSuperAdmin = false) => {
    try {
      const scoped = scopeQuery(
        {
          text: `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
          values: [id],
        },
        { centerId, isSuperAdmin, column: "center_id" },
      );

      const res = await pool.query(scoped.text, scoped.values);
      if (res.rowCount === 0) return null;
      return res.rows[0];
    } catch (err) {
      throw new Error(
        `Error deleting record from ${tableName}: ${err.message}`,
      );
    }
  },
};

module.exports = medicalReimbursementModel;

