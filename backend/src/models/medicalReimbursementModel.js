const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
} = require("../utils/modelHelpers");

const tableName = "medical_reimbursement";

const medicalReimbursementModel = {
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
        if (row.receipt && row.receipt_filename) {
          row.receipt = "exists";
        } else if (row.receipt) {
          row.receipt = row.receipt.toString("base64");
        }
        if (row.supporting_docs && row.supporting_docs_filename) {
          row.supporting_docs = "exists";
        } else if (row.supporting_docs) {
          row.supporting_docs = row.supporting_docs.toString("base64");
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
      if (row.receipt && row.receipt_filename) {
        row.receipt = "exists";
      } else if (row.receipt) {
        row.receipt = row.receipt.toString("base64");
      }
      if (row.supporting_docs && row.supporting_docs_filename) {
        row.supporting_docs = "exists";
      } else if (row.supporting_docs) {
        row.supporting_docs = row.supporting_docs.toString("base64");
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
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING id, receipt_filename, supporting_docs_filename`;
      
      let res;
      try {
        res = await pool.query(query, values);
      } catch (dbError) {
        console.error('Model create - Database error:', dbError.message);
        console.error('Model create - Database error code:', dbError.code);
        throw dbError;
      }
      const result = res.rows[0];
      
      // Verify by querying directly - RETURNING * might not return BYTEA fields
      if (result.id) {
        const verifyQuery = `SELECT receipt, receipt_filename, supporting_docs, supporting_docs_filename FROM ${tableName} WHERE id = $1`;
        const verifyRes = await pool.query(verifyQuery, [result.id]);
        const verifyRow = verifyRes.rows[0];
        
        // Return the verified data with BYTEA fields
        return verifyRow || result;
      }
      
      return result;
    } catch (err) {
      console.error('Model create - Error:', err.message);
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
      const result = res.rows[0];
      return result;
    } catch (err) {
      console.error('Model update - Error:', err.message);
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

module.exports = medicalReimbursementModel;

