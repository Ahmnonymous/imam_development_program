const nikahBonusModel = require('../models/nikahBonusModel');
const fs = require('fs').promises;

const nikahBonusController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await nikahBonusModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await nikahBonusModel.getById(req.params.id); 
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
      
      if (req.files && req.files.Certificate && req.files.Certificate.length > 0) {
        const file = req.files.Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.certificate = buffer;
        fields.certificate_filename = file.originalname;
        fields.certificate_mime = file.mimetype;
        fields.certificate_size = file.size;
        fields.certificate_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Nikah_Image && req.files.Nikah_Image.length > 0) {
        const file = req.files.Nikah_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.nikah_image = buffer;
        fields.nikah_image_filename = file.originalname;
        fields.nikah_image_mime = file.mimetype;
        fields.nikah_image_size = file.size;
        fields.nikah_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await nikahBonusModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Nikah_Bonus: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Certificate && req.files.Certificate.length > 0) {
        const file = req.files.Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.certificate = buffer;
        fields.certificate_filename = file.originalname;
        fields.certificate_mime = file.mimetype;
        fields.certificate_size = file.size;
        fields.certificate_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Nikah_Image && req.files.Nikah_Image.length > 0) {
        const file = req.files.Nikah_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.nikah_image = buffer;
        fields.nikah_image_filename = file.originalname;
        fields.nikah_image_mime = file.mimetype;
        fields.nikah_image_size = file.size;
        fields.nikah_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await nikahBonusModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Nikah_Bonus: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await nikahBonusModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewCertificate: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT certificate, certificate_filename, certificate_mime, certificate_size FROM nikah_bonus WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.certificate && !record.certificate_filename) return res.status(404).send("No certificate found");
  
      const mimeType = record.certificate_mime || "application/pdf";
      const filename = record.certificate_filename || "certificate";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.certificate_filename && !record.certificate) {
        return res.status(404).send("Certificate file data not found in database");
      }
  
      let buffer = record.certificate;
      
      if (!buffer) {
        return res.status(404).send("No certificate found");
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
      console.error("Error viewing certificate:", err);
      res.status(500).json({ error: "Error viewing certificate: " + err.message });
    }
  },

  viewNikahImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT nikah_image, nikah_image_filename, nikah_image_mime, nikah_image_size FROM nikah_bonus WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.nikah_image && !record.nikah_image_filename) return res.status(404).send("No image found");
  
      const mimeType = record.nikah_image_mime || "image/jpeg";
      const filename = record.nikah_image_filename || "nikah_image";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.nikah_image_filename && !record.nikah_image) {
        return res.status(404).send("Nikah image file data not found in database");
      }
  
      let buffer = record.nikah_image;
      
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
      console.error("Error viewing nikah image:", err);
      res.status(500).json({ error: "Error viewing nikah image: " + err.message });
    }
  },

  downloadCertificate: async (req, res) => {
    try {
      const record = await nikahBonusModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.certificate) return res.status(404).send("No certificate found");
  
      const mimeType = record.certificate_mime || "application/pdf";
      const filename = record.certificate_filename || "certificate";
  
      let buffer = record.certificate;
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
      res.status(500).json({ error: "Error downloading certificate: " + err.message });
    }
  },

  downloadImage: async (req, res) => {
    try {
      const record = await nikahBonusModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.nikah_image) return res.status(404).send("No image found");
  
      const mimeType = record.nikah_image_mime || "image/jpeg";
      const filename = record.nikah_image_filename || "nikah_image";
  
      let buffer = record.nikah_image;
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
      res.status(500).json({ error: "Error downloading image: " + err.message });
    }
  },
};

module.exports = nikahBonusController;

