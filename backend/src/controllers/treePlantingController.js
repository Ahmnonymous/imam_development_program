const treePlantingModel = require('../models/treePlantingModel');
const fs = require('fs').promises;

const treePlantingController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await treePlantingModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await treePlantingModel.getById(req.params.id); 
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
      
      if (req.files && req.files.Planting_Image && req.files.Planting_Image.length > 0) {
        const file = req.files.Planting_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.planting_image = buffer;
        fields.planting_image_filename = file.originalname;
        fields.planting_image_mime = file.mimetype;
        fields.planting_image_size = file.size;
        fields.planting_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await treePlantingModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Tree_Planting: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Planting_Image && req.files.Planting_Image.length > 0) {
        const file = req.files.Planting_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.planting_image = buffer;
        fields.planting_image_filename = file.originalname;
        fields.planting_image_mime = file.mimetype;
        fields.planting_image_size = file.size;
        fields.planting_image_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await treePlantingModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Tree_Planting: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await treePlantingModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewPlantingImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT planting_image, planting_image_filename, planting_image_mime, planting_image_size FROM Tree_Planting WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.planting_image && !record.planting_image_filename) return res.status(404).send("No image found");
  
      const mimeType = record.planting_image_mime || "image/jpeg";
      const filename = record.planting_image_filename || "planting_image";
  
      if (record.planting_image_filename && !record.planting_image) {
        return res.status(404).send("Planting image file data not found in database");
      }
  
      let buffer = record.planting_image;
      
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
      console.error("Error viewing planting image:", err);
      res.status(500).json({ error: "Error viewing planting image: " + err.message });
    }
  },

  downloadImage: async (req, res) => {
    try {
      const record = await treePlantingModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.planting_image) return res.status(404).send("No image found");
  
      const mimeType = record.planting_image_mime || "image/jpeg";
      const filename = record.planting_image_filename || "planting_image";
  
      let buffer = record.planting_image;
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

module.exports = treePlantingController;

