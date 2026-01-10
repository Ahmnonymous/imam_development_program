const pool = require("../config/db");
const {
  buildInsertFragments,
  buildUpdateFragments,
  scopeQuery,
} = require("../utils/modelHelpers");

// PostgreSQL converts unquoted identifiers to lowercase, so "borehole" matches the schema
const tableName = "borehole";

const boreholeModel = {
  getAll: async (imamProfileId = null) => {
    try {
      let query = `
        SELECT 
          b.*,
          bl.Name as where_required_name,
          ws.Name as current_water_source_name
        FROM ${tableName} b
        LEFT JOIN Borehole_Location bl ON b.where_required = bl.ID
        LEFT JOIN Water_Source ws ON b.current_water_source = ws.ID
      `;
      const params = [];
      
      if (imamProfileId) {
        query += ` WHERE b.imam_profile_id = $1`;
        params.push(imamProfileId);
      }
      
      query += ` ORDER BY b.id DESC`;

      const res = await pool.query(query, params);
      
      // Fetch water usage purposes for each borehole
      for (let row of res.rows) {
        const purposesQuery = `
          SELECT wup.ID, wup.Name 
          FROM Borehole_Water_Usage_Purpose bwup
          JOIN Water_Usage_Purpose wup ON bwup.water_usage_purpose_id = wup.ID
          WHERE bwup.borehole_id = $1
          ORDER BY wup.Name
        `;
        const purposesRes = await pool.query(purposesQuery, [row.id]);
        row.water_usage_purposes = purposesRes.rows.map(p => p.name).join(', ');
        row.water_usage_purpose_ids = purposesRes.rows.map(p => p.id);
        
        if (row.current_water_source_image && row.current_water_source_image_filename) {
          row.current_water_source_image = "exists";
        } else if (row.current_water_source_image) {
          row.current_water_source_image = row.current_water_source_image.toString("base64");
        }
        if (row.masjid_area_image && row.masjid_area_image_filename) {
          row.masjid_area_image = "exists";
        } else if (row.masjid_area_image) {
          row.masjid_area_image = row.masjid_area_image.toString("base64");
        }
      }
      return res.rows;
    } catch (err) {
      throw new Error(
        `Error fetching all records from ${tableName}: ${err.message}`,
      );
    }
  },

  getById: async (id) => {
    try {
      const query = `
        SELECT 
          b.*,
          bl.Name as where_required_name,
          ws.Name as current_water_source_name
        FROM ${tableName} b
        LEFT JOIN Borehole_Location bl ON b.where_required = bl.ID
        LEFT JOIN Water_Source ws ON b.current_water_source = ws.ID
        WHERE b.id = $1
      `;
      const res = await pool.query(query, [id]);
      if (!res.rows[0]) return null;
      const row = res.rows[0];
      
      // Fetch water usage purposes
      const purposesQuery = `
        SELECT wup.ID, wup.Name 
        FROM Borehole_Water_Usage_Purpose bwup
        JOIN Water_Usage_Purpose wup ON bwup.water_usage_purpose_id = wup.ID
        WHERE bwup.borehole_id = $1
        ORDER BY wup.Name
      `;
      const purposesRes = await pool.query(purposesQuery, [id]);
      row.water_usage_purposes = purposesRes.rows.map(p => p.name).join(', ');
      row.water_usage_purpose_ids = purposesRes.rows.map(p => p.id);
      
      if (row.current_water_source_image && row.current_water_source_image_filename) {
        row.current_water_source_image = "exists";
      } else if (row.current_water_source_image) {
        row.current_water_source_image = row.current_water_source_image.toString("base64");
      }
      if (row.masjid_area_image && row.masjid_area_image_filename) {
        row.masjid_area_image = "exists";
      } else if (row.masjid_area_image) {
        row.masjid_area_image = row.masjid_area_image.toString("base64");
      }
      return row;
    } catch (err) {
      throw new Error(
        `Error fetching record by ID from ${tableName}: ${err.message}`,
      );
    }
  },

  create: async (fields) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Extract water_usage_purpose_ids if present
      const waterUsagePurposeIds = fields.water_usage_purpose_ids || [];
      delete fields.water_usage_purpose_ids;
      
      // Remove any fields that don't exist in the table (like water_usage_purposes)
      const validColumns = [
        'imam_profile_id', 'where_required', 'has_electricity', 'received_borehole_before',
        'current_water_source', 'distance_to_water_source', 'beneficiaries_count',
        'challenges_due_to_lack_of_water', 'motivation', 'current_water_source_image',
        'current_water_source_image_filename', 'current_water_source_image_mime',
        'current_water_source_image_size', 'current_water_source_image_updated_at',
        'current_water_source_image_show_link', 'masjid_area_image', 'masjid_area_image_filename',
        'masjid_area_image_mime', 'masjid_area_image_size', 'masjid_area_image_updated_at',
        'masjid_area_image_show_link', 'longitude', 'latitude', 'acknowledge', 'status_id',
        'comment', 'datestamp', 'Created_By', 'Created_At', 'Updated_By', 'Updated_At'
      ];
      
      const filteredFields = {};
      Object.keys(fields).forEach(key => {
        if (validColumns.includes(key)) {
          filteredFields[key] = fields[key];
        }
      });
      
      const { columns, values, placeholders } = buildInsertFragments(filteredFields, {
        quote: false,
      });
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const res = await client.query(query, values);
      const newRecord = res.rows[0];
      
      // Insert water usage purposes into junction table
      if (waterUsagePurposeIds.length > 0) {
        const username = fields.created_by || 'system';
        for (const purposeId of waterUsagePurposeIds) {
          await client.query(
            `INSERT INTO Borehole_Water_Usage_Purpose (borehole_id, water_usage_purpose_id, Created_By, Updated_By) 
             VALUES ($1, $2, $3, $4)`,
            [newRecord.id, purposeId, username, username]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch the complete record with lookups
      return await boreholeModel.getById(newRecord.id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw Error(`Error creating record in ${tableName}: ${err.message}`);
    } finally {
      client.release();
    }
  },

  update: async (id, fields) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Extract water_usage_purpose_ids if present
      const waterUsagePurposeIds = fields.water_usage_purpose_ids !== undefined ? fields.water_usage_purpose_ids : null;
      delete fields.water_usage_purpose_ids;
      
      // Remove any fields that don't exist in the table (like water_usage_purposes)
      // Note: PostgreSQL is case-insensitive for unquoted identifiers, but we need to map to the actual column names
      const validColumnsLower = [
        'imam_profile_id', 'where_required', 'has_electricity', 'received_borehole_before',
        'current_water_source', 'distance_to_water_source', 'beneficiaries_count',
        'challenges_due_to_lack_of_water', 'motivation', 'current_water_source_image',
        'current_water_source_image_filename', 'current_water_source_image_mime',
        'current_water_source_image_size', 'current_water_source_image_updated_at',
        'current_water_source_image_show_link', 'masjid_area_image', 'masjid_area_image_filename',
        'masjid_area_image_mime', 'masjid_area_image_size', 'masjid_area_image_updated_at',
        'masjid_area_image_show_link', 'longitude', 'latitude', 'acknowledge', 'status_id',
        'comment', 'datestamp', 'updated_by', 'updated_at'
      ].map(col => col.toLowerCase());
      
      // Map lowercase column names to their actual database column names (for WHO columns)
      const columnMapping = {
        'updated_by': 'Updated_By',
        'updated_at': 'Updated_At'
      };
      
      const filteredFields = {};
      Object.keys(fields).forEach(key => {
        const normalizedKey = key.toLowerCase();
        // Check if key exists in validColumns (case-insensitive check)
        if (validColumnsLower.includes(normalizedKey)) {
          // Use the mapped column name if it exists, otherwise use the original key (PostgreSQL will handle case)
          const dbColumnName = columnMapping[key] || key;
          filteredFields[dbColumnName] = fields[key];
        }
      });
      
      // Check if there are any fields to update
      if (Object.keys(filteredFields).length === 0) {
        await client.query('ROLLBACK');
        throw new Error('No valid fields to update');
      }
      
      const { setClause, values } = buildUpdateFragments(filteredFields, {
        quote: false,
      });
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
      const res = await client.query(query, [...values, id]);
      if (res.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      // Update water usage purposes if provided
      if (waterUsagePurposeIds !== null) {
        const username = fields.updated_by || 'system';
        // Delete existing purposes
        await client.query(
          `DELETE FROM Borehole_Water_Usage_Purpose WHERE borehole_id = $1`,
          [id]
        );
        // Insert new purposes
        if (waterUsagePurposeIds.length > 0) {
          for (const purposeId of waterUsagePurposeIds) {
            await client.query(
              `INSERT INTO Borehole_Water_Usage_Purpose (borehole_id, water_usage_purpose_id, Created_By, Updated_By) 
               VALUES ($1, $2, $3, $4)`,
              [id, purposeId, username, username]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch the complete record with lookups
      return await boreholeModel.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(
        `Error updating record in ${tableName}: ${err.message}`,
      );
    } finally {
      client.release();
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

module.exports = boreholeModel;

