const newBabyBonusModel = require('../models/newBabyBonusModel');
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
      
      if (req.files && req.files.Baby_Image && req.files.Baby_Image.length > 0) {
        const file = req.files.Baby_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.Baby_Image = buffer;
        fields.Baby_Image_Filename = file.originalname;
        fields.Baby_Image_Mime = file.mimetype;
        fields.Baby_Image_Size = file.size;
        fields.Baby_Image_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Birth_Certificate && req.files.Birth_Certificate.length > 0) {
        const file = req.files.Birth_Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.Birth_Certificate = buffer;
        fields.Birth_Certificate_Filename = file.originalname;
        fields.Birth_Certificate_Mime = file.mimetype;
        fields.Birth_Certificate_Size = file.size;
        fields.Birth_Certificate_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await newBabyBonusModel.create(fields); 
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
      
      if (req.files && req.files.Baby_Image && req.files.Baby_Image.length > 0) {
        const file = req.files.Baby_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.Baby_Image = buffer;
        fields.Baby_Image_Filename = file.originalname;
        fields.Baby_Image_Mime = file.mimetype;
        fields.Baby_Image_Size = file.size;
        fields.Baby_Image_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Birth_Certificate && req.files.Birth_Certificate.length > 0) {
        const file = req.files.Birth_Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.Birth_Certificate = buffer;
        fields.Birth_Certificate_Filename = file.originalname;
        fields.Birth_Certificate_Mime = file.mimetype;
        fields.Birth_Certificate_Size = file.size;
        fields.Birth_Certificate_Updated_At = new Date().toISOString();
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

  downloadBabyImage: async (req, res) => {
    try {
      const record = await newBabyBonusModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Baby_Image) return res.status(404).send("No baby image found");
  
      const mimeType = record.Baby_Image_Mime || "image/jpeg";
      const filename = record.Baby_Image_Filename || "baby_image";
  
      let buffer = record.Baby_Image;
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
      if (!record.Birth_Certificate) return res.status(404).send("No birth certificate found");
  
      const mimeType = record.Birth_Certificate_Mime || "application/pdf";
      const filename = record.Birth_Certificate_Filename || "birth_certificate";
  
      let buffer = record.Birth_Certificate;
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

