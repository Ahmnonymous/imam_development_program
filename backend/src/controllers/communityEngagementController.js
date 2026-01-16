const communityEngagementModel = require('../models/communityEngagementModel');
const { afterCreate } = require('../utils/modelHelpers');
const fs = require('fs').promises;

const communityEngagementController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await communityEngagementModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await communityEngagementModel.getById(req.params.id); 
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
      
      // Convert empty strings to null for nullable bigint fields
      if (fields.engagement_type === '' || fields.engagement_type === undefined) {
        fields.engagement_type = null;
      } else if (fields.engagement_type !== null && typeof fields.engagement_type === 'string') {
        // Parse string values to integers
        const parsed = parseInt(fields.engagement_type, 10);
        fields.engagement_type = isNaN(parsed) ? null : parsed;
      }
      
      if (req.files && req.files.Engagement_Image && req.files.Engagement_Image.length > 0) {
        const file = req.files.Engagement_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.engagement_image = buffer;
        fields.engagement_image_filename = file.originalname;
        fields.engagement_image_mime = file.mimetype;
        fields.engagement_image_size = file.size;
        fields.engagement_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await communityEngagementModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('Community_Engagement', data);
      
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Community_Engagement: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      // Convert empty strings to null for nullable bigint fields
      if (fields.engagement_type === '' || fields.engagement_type === undefined) {
        fields.engagement_type = null;
      } else if (fields.engagement_type !== null && typeof fields.engagement_type === 'string') {
        // Parse string values to integers
        const parsed = parseInt(fields.engagement_type, 10);
        fields.engagement_type = isNaN(parsed) ? null : parsed;
      }
      
      // Remove file-related fields if no file is provided
      if (!req.files || !req.files.Engagement_Image || req.files.Engagement_Image.length === 0) {
        delete fields.engagement_image;
        delete fields.engagement_image_filename;
        delete fields.engagement_image_mime;
        delete fields.engagement_image_size;
        delete fields.engagement_image_updated_at;
      } else {
        const file = req.files.Engagement_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.engagement_image = buffer;
        fields.engagement_image_filename = file.originalname;
        fields.engagement_image_mime = file.mimetype;
        fields.engagement_image_size = file.size;
        fields.engagement_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      // Clean up undefined values
      Object.keys(fields).forEach(key => {
        if (fields[key] === undefined) {
          delete fields[key];
        }
      });
      
      const data = await communityEngagementModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Community_Engagement: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await communityEngagementModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewEngagementImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT engagement_image, engagement_image_filename, engagement_image_mime, engagement_image_size FROM community_engagement WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.engagement_image && !record.engagement_image_filename) return res.status(404).send("No image found");
  
      const mimeType = record.engagement_image_mime || "image/jpeg";
      const filename = record.engagement_image_filename || "engagement_image";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.engagement_image_filename && !record.engagement_image) {
        return res.status(404).send("Engagement image file data not found in database");
      }
  
      let buffer = record.engagement_image;
      
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
      console.error("Error viewing engagement image:", err);
      res.status(500).json({ error: "Error viewing engagement image: " + err.message });
    }
  },

  downloadImage: async (req, res) => {
    try {
      const record = await communityEngagementModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.engagement_image) return res.status(404).send("No image found");
  
      const mimeType = record.engagement_image_mime || "image/jpeg";
      const filename = record.engagement_image_filename || "engagement_image";
  
      let buffer = record.engagement_image;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown image encoding");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading image: " + err.message });
    }
  },
};

module.exports = communityEngagementController;

