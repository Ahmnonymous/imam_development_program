const newBabyBonusModel = require('../models/newBabyBonusModel');
const { afterCreate } = require('../utils/modelHelpers');
const fs = require('fs').promises;

const newBabyBonusController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await newBabyBonusModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await newBabyBonusModel.getById(req.params.id); 
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
      if (fields.baby_gender === '' || fields.baby_gender === undefined) {
        fields.baby_gender = null;
      } else if (fields.baby_gender !== null && typeof fields.baby_gender === 'string') {
        const parsed = parseInt(fields.baby_gender, 10);
        fields.baby_gender = isNaN(parsed) ? null : parsed;
      }
      
      if (req.files && req.files.Baby_Image && req.files.Baby_Image.length > 0) {
        const file = req.files.Baby_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.baby_image = buffer;
        fields.baby_image_filename = file.originalname;
        fields.baby_image_mime = file.mimetype;
        fields.baby_image_size = file.size;
        fields.baby_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Birth_Certificate && req.files.Birth_Certificate.length > 0) {
        const file = req.files.Birth_Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.birth_certificate = buffer;
        fields.birth_certificate_filename = file.originalname;
        fields.birth_certificate_mime = file.mimetype;
        fields.birth_certificate_size = file.size;
        fields.birth_certificate_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await newBabyBonusModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('New_Baby_Bonus', data);
      
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in New_Baby_Bonus: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      // Convert empty strings to null for nullable bigint fields
      if (fields.baby_gender === '' || fields.baby_gender === undefined) {
        fields.baby_gender = null;
      } else if (fields.baby_gender !== null && typeof fields.baby_gender === 'string') {
        const parsed = parseInt(fields.baby_gender, 10);
        fields.baby_gender = isNaN(parsed) ? null : parsed;
      }
      
      if (req.files && req.files.Baby_Image && req.files.Baby_Image.length > 0) {
        const file = req.files.Baby_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.baby_image = buffer;
        fields.baby_image_filename = file.originalname;
        fields.baby_image_mime = file.mimetype;
        fields.baby_image_size = file.size;
        fields.baby_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Birth_Certificate && req.files.Birth_Certificate.length > 0) {
        const file = req.files.Birth_Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.birth_certificate = buffer;
        fields.birth_certificate_filename = file.originalname;
        fields.birth_certificate_mime = file.mimetype;
        fields.birth_certificate_size = file.size;
        fields.birth_certificate_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await newBabyBonusModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in New_Baby_Bonus: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await newBabyBonusModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewBabyImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT baby_image, baby_image_filename, baby_image_mime, baby_image_size FROM new_baby_bonus WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.baby_image && !record.baby_image_filename) return res.status(404).send("No baby image found");
  
      const mimeType = record.baby_image_mime || "image/jpeg";
      const filename = record.baby_image_filename || "baby_image";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.baby_image_filename && !record.baby_image) {
        return res.status(404).send("Baby image file data not found in database");
      }
  
      let buffer = record.baby_image;
      
      if (!buffer) {
        return res.status(404).send("No baby image found");
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
      console.error("Error viewing baby image:", err);
      res.status(500).json({ error: "Error viewing baby image: " + err.message });
    }
  },

  viewBirthCertificate: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT birth_certificate, birth_certificate_filename, birth_certificate_mime, birth_certificate_size FROM new_baby_bonus WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.birth_certificate && !record.birth_certificate_filename) return res.status(404).send("No birth certificate found");
  
      const mimeType = record.birth_certificate_mime || "application/pdf";
      const filename = record.birth_certificate_filename || "birth_certificate";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.birth_certificate_filename && !record.birth_certificate) {
        return res.status(404).send("Birth certificate file data not found in database");
      }
  
      let buffer = record.birth_certificate;
      
      if (!buffer) {
        return res.status(404).send("No birth certificate found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown certificate encoding");
          }
        } else {
          throw new Error("Invalid certificate data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Certificate buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing birth certificate:", err);
      res.status(500).json({ error: "Error viewing birth certificate: " + err.message });
    }
  },

  downloadBabyImage: async (req, res) => {
    try {
      const record = await newBabyBonusModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.baby_image) return res.status(404).send("No baby image found");
  
      const mimeType = record.baby_image_mime || "image/jpeg";
      const filename = record.baby_image_filename || "baby_image";
  
      let buffer = record.baby_image;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading baby image: " + err.message });
    }
  },

  downloadBirthCertificate: async (req, res) => {
    try {
      const record = await newBabyBonusModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.birth_certificate) return res.status(404).send("No birth certificate found");
  
      const mimeType = record.birth_certificate_mime || "application/pdf";
      const filename = record.birth_certificate_filename || "birth_certificate";
  
      let buffer = record.birth_certificate;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading birth certificate: " + err.message });
    }
  },
};

module.exports = newBabyBonusController;

