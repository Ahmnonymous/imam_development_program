const boreholeModel = require('../models/boreholeModel');
const fs = require('fs').promises;

const boreholeController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await boreholeModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await boreholeModel.getById(req.params.id); 
      if(!data) return res.status(404).json({error: 'Not found'}); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  create: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.created_by = username;
      fields.updated_by = username;
      
      // Remove water_usage_purposes if it exists (old field, no longer in table)
      delete fields.water_usage_purposes;
      
      // Convert acknowledge to boolean
      if (fields.acknowledge !== undefined) {
        fields.acknowledge = fields.acknowledge === 'true' || fields.acknowledge === true || fields.acknowledge === '1' || fields.acknowledge === 1;
      }
      
      // Handle water_usage_purpose_ids array (from FormData)
      if (req.body.water_usage_purpose_ids) {
        if (Array.isArray(req.body.water_usage_purpose_ids)) {
          fields.water_usage_purpose_ids = req.body.water_usage_purpose_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
        } else if (typeof req.body.water_usage_purpose_ids === 'string') {
          // Handle JSON string format
          try {
            const parsed = JSON.parse(req.body.water_usage_purpose_ids);
            fields.water_usage_purpose_ids = Array.isArray(parsed) ? parsed.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
          } catch (e) {
            fields.water_usage_purpose_ids = [];
          }
        } else {
          fields.water_usage_purpose_ids = [parseInt(req.body.water_usage_purpose_ids)].filter(id => !isNaN(id));
        }
      } else {
        fields.water_usage_purpose_ids = [];
      }
      
      if (req.files && req.files.Current_Water_Source_Image && req.files.Current_Water_Source_Image.length > 0) {
        const file = req.files.Current_Water_Source_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.current_water_source_image = buffer;
        fields.current_water_source_image_filename = file.originalname;
        fields.current_water_source_image_mime = file.mimetype;
        fields.current_water_source_image_size = file.size;
        fields.current_water_source_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Masjid_Area_Image && req.files.Masjid_Area_Image.length > 0) {
        const file = req.files.Masjid_Area_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.masjid_area_image = buffer;
        fields.masjid_area_image_filename = file.originalname;
        fields.masjid_area_image_mime = file.mimetype;
        fields.masjid_area_image_size = file.size;
        fields.masjid_area_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await boreholeModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Borehole: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      // Remove water_usage_purposes if it exists (old field, no longer in table)
      delete fields.water_usage_purposes;
      
      // Convert lookup IDs to integers (they come as strings from FormData)
      if (fields.where_required) {
        const whereRequiredId = parseInt(fields.where_required);
        if (!isNaN(whereRequiredId)) {
          fields.where_required = whereRequiredId;
        } else {
          delete fields.where_required; // Invalid value, remove it
        }
      }
      
      if (fields.current_water_source) {
        const waterSourceId = parseInt(fields.current_water_source);
        if (!isNaN(waterSourceId)) {
          fields.current_water_source = waterSourceId;
        } else {
          delete fields.current_water_source; // Invalid value, remove it
        }
      }
      
      if (fields.has_electricity) {
        const electricityId = parseInt(fields.has_electricity);
        if (!isNaN(electricityId)) {
          fields.has_electricity = electricityId;
        } else {
          delete fields.has_electricity;
        }
      }
      
      if (fields.received_borehole_before) {
        const receivedBeforeId = parseInt(fields.received_borehole_before);
        if (!isNaN(receivedBeforeId)) {
          fields.received_borehole_before = receivedBeforeId;
        } else {
          delete fields.received_borehole_before;
        }
      }
      
      // Convert acknowledge to boolean
      if (fields.acknowledge !== undefined) {
        fields.acknowledge = fields.acknowledge === 'true' || fields.acknowledge === true || fields.acknowledge === '1' || fields.acknowledge === 1;
      }
      
      // Handle water_usage_purpose_ids array (from FormData)
      if (req.body.water_usage_purpose_ids !== undefined) {
        if (Array.isArray(req.body.water_usage_purpose_ids)) {
          fields.water_usage_purpose_ids = req.body.water_usage_purpose_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
        } else if (typeof req.body.water_usage_purpose_ids === 'string') {
          // Handle JSON string format
          try {
            const parsed = JSON.parse(req.body.water_usage_purpose_ids);
            fields.water_usage_purpose_ids = Array.isArray(parsed) ? parsed.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
          } catch (e) {
            fields.water_usage_purpose_ids = [];
          }
        } else if (req.body.water_usage_purpose_ids === null || req.body.water_usage_purpose_ids === '') {
          fields.water_usage_purpose_ids = [];
        } else {
          fields.water_usage_purpose_ids = [parseInt(req.body.water_usage_purpose_ids)].filter(id => !isNaN(id));
        }
      }
      
      // Remove file-related fields if no file is provided
      if (!req.files || !req.files.Current_Water_Source_Image || req.files.Current_Water_Source_Image.length === 0) {
        delete fields.current_water_source_image;
        delete fields.current_water_source_image_filename;
        delete fields.current_water_source_image_mime;
        delete fields.current_water_source_image_size;
        delete fields.current_water_source_image_updated_at;
      } else {
        const file = req.files.Current_Water_Source_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.current_water_source_image = buffer;
        fields.current_water_source_image_filename = file.originalname;
        fields.current_water_source_image_mime = file.mimetype;
        fields.current_water_source_image_size = file.size;
        fields.current_water_source_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (!req.files || !req.files.Masjid_Area_Image || req.files.Masjid_Area_Image.length === 0) {
        delete fields.masjid_area_image;
        delete fields.masjid_area_image_filename;
        delete fields.masjid_area_image_mime;
        delete fields.masjid_area_image_size;
        delete fields.masjid_area_image_updated_at;
      } else {
        const file = req.files.Masjid_Area_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.masjid_area_image = buffer;
        fields.masjid_area_image_filename = file.originalname;
        fields.masjid_area_image_mime = file.mimetype;
        fields.masjid_area_image_size = file.size;
        fields.masjid_area_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      // Clean up undefined values
      Object.keys(fields).forEach(key => {
        if (fields[key] === undefined) {
          delete fields[key];
        }
      });
      
      const data = await boreholeModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Borehole: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await boreholeModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewCurrentWaterSourceImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT current_water_source_image, current_water_source_image_filename, current_water_source_image_mime, current_water_source_image_size FROM borehole WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.current_water_source_image && !record.current_water_source_image_filename) return res.status(404).send("No image found");
  
      const mimeType = record.current_water_source_image_mime || "image/jpeg";
      const filename = record.current_water_source_image_filename || "current_water_source_image";
  
      if (record.current_water_source_image_filename && !record.current_water_source_image) {
        return res.status(404).send("Image file data not found in database");
      }
  
      let buffer = record.current_water_source_image;
      
      if (!buffer) {
        return res.status(404).send("No image found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown image encoding");
          }
        } else {
          throw new Error("Invalid image data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Image buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing current water source image:", err);
      res.status(500).json({ error: "Error viewing image: " + err.message });
    }
  },

  viewMasjidAreaImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT masjid_area_image, masjid_area_image_filename, masjid_area_image_mime, masjid_area_image_size FROM borehole WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.masjid_area_image && !record.masjid_area_image_filename) return res.status(404).send("No image found");
  
      const mimeType = record.masjid_area_image_mime || "image/jpeg";
      const filename = record.masjid_area_image_filename || "masjid_area_image";
  
      if (record.masjid_area_image_filename && !record.masjid_area_image) {
        return res.status(404).send("Image file data not found in database");
      }
  
      let buffer = record.masjid_area_image;
      
      if (!buffer) {
        return res.status(404).send("No image found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown image encoding");
          }
        } else {
          throw new Error("Invalid image data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Image buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing masjid area image:", err);
      res.status(500).json({ error: "Error viewing image: " + err.message });
    }
  },
};

module.exports = boreholeController;

