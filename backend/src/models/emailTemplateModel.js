const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
} = require("../utils/modelHelpers");

const tableName = "Email_Templates";

const emailTemplateModel = {
  getAll: async () => {
    try {
      const query = `SELECT * FROM ${tableName} ORDER BY template_name ASC`;
      const res = await pool.query(query);
      return res.rows.map((row) => {
        if (row.background_image && row.background_image_filename) {
          row.background_image = "exists";
        } else if (row.background_image) {
          row.background_image = row.background_image.toString("base64");
        }
        return row;
      });
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
      if (row.background_image && row.background_image_filename) {
        row.background_image = "exists";
      } else if (row.background_image) {
        row.background_image = row.background_image.toString("base64");
      }
      return row;
    } catch (err) {
      throw new Error(
        `Error fetching record by ID from ${tableName}: ${err.message}`,
      );
    }
  },

  getByType: async (templateType) => {
    try {
      const query = `SELECT * FROM ${tableName} WHERE template_type = $1 AND is_active = true ORDER BY id DESC LIMIT 1`;
      const res = await pool.query(query, [templateType]);
      if (!res.rows[0]) return null;
      const row = res.rows[0];
      if (row.background_image && row.background_image_filename) {
        row.background_image = "exists";
      } else if (row.background_image) {
        row.background_image = row.background_image.toString("base64");
      }
      return row;
    } catch (err) {
      throw new Error(
        `Error fetching record by type from ${tableName}: ${err.message}`,
      );
    }
  },

  getByName: async (templateName) => {
    try {
      const query = `SELECT * FROM ${tableName} WHERE template_name = $1 AND is_active = true ORDER BY id DESC LIMIT 1`;
      const res = await pool.query(query, [templateName]);
      if (!res.rows[0]) return null;
      const row = res.rows[0];
      if (row.background_image && row.background_image_filename) {
        row.background_image = "exists";
      } else if (row.background_image) {
        row.background_image = row.background_image.toString("base64");
      }
      return row;
    } catch (err) {
      throw new Error(
        `Error fetching record by name from ${tableName}: ${err.message}`,
      );
    }
  },

  getByTrigger: async (triggerTableName, action, statusId = null, recipientType = null) => {
    try {
      // Get all active templates from Email_Templates table
      // Note: triggerTableName is the table that triggered the email (e.g., "Jumuah_Khutbah_Topic")
      // We need to query the Email_Templates table, not the trigger table
      let query = `SELECT * FROM ${tableName} WHERE is_active = true`;
      const queryParams = [];
      
      // Optionally filter by recipient_type
      if (recipientType) {
        query += ` AND recipient_type = $1`;
        queryParams.push(recipientType);
      }
      
      query += ` ORDER BY id DESC`;
      const res = await pool.query(query, queryParams);
      
      // Find template that has matching trigger
      for (const row of res.rows) {
        if (!row.email_triggers) continue;
        
        let triggers = [];
        try {
          triggers = typeof row.email_triggers === 'string' 
            ? JSON.parse(row.email_triggers) 
            : row.email_triggers;
        } catch (e) {
          continue;
        }
        
        // Check if this template has a trigger matching the table, action, and optionally status_id
        let hasTrigger = false;
        
        if (statusId !== null) {
          // If status_id is provided (status changed), match triggers with matching status_id
          // Only fallback to triggers without status_id if no status-specific triggers exist
          const statusSpecificTriggers = triggers.filter(trigger => 
            trigger.table_name === triggerTableName && 
            trigger.action === action &&
            trigger.status_id !== undefined
          );
          
          if (statusSpecificTriggers.length > 0) {
            // If there are status-specific triggers, only match the exact status_id
            hasTrigger = statusSpecificTriggers.some(trigger => 
              parseInt(trigger.status_id) === parseInt(statusId)
            );
          } else {
            // Fallback: match triggers without status_id only if no status-specific triggers exist (for backward compatibility)
            hasTrigger = triggers.some(trigger => 
              trigger.table_name === triggerTableName && 
              trigger.action === action &&
              trigger.status_id === undefined
            );
          }
        } else {
          // If no status_id provided (no status change), only match triggers without status_id
          // This prevents status-specific templates from matching when status hasn't changed
          hasTrigger = triggers.some(trigger => 
            trigger.table_name === triggerTableName && 
            trigger.action === action &&
            trigger.status_id === undefined
          );
        }
        
        if (hasTrigger) {
          if (row.background_image && row.background_image_filename) {
            row.background_image = "exists";
          } else if (row.background_image) {
            row.background_image = row.background_image.toString("base64");
          }
          return row;
        }
      }
      
      return null;
    } catch (err) {
      throw new Error(
        `Error fetching record by trigger from ${tableName}: ${err.message}`,
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
      if (row.background_image && row.background_image_filename) {
        row.background_image = "exists";
      } else if (row.background_image) {
        row.background_image = row.background_image.toString("base64");
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
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${
        values.length + 1
      } RETURNING *`;
      const res = await pool.query(query, [...values, id]);
      if (res.rowCount === 0) return null;
      const row = res.rows[0];
      if (row.background_image && row.background_image_filename) {
        row.background_image = "exists";
      } else if (row.background_image) {
        row.background_image = row.background_image.toString("base64");
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
      return res.rowCount > 0;
    } catch (err) {
      throw new Error(`Error deleting record from ${tableName}: ${err.message}`);
    }
  },
};

module.exports = emailTemplateModel;


