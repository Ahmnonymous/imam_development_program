const nikahBonusModel = require('../models/nikahBonusModel');
const fs = require('fs').promises;

const nikahBonusController = {
  getAll: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await nikahBonusModel.getAll(centerId, isSuperAdmin, imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await nikahBonusModel.getById(req.params.id, centerId, isSuperAdmin); 
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
      
      fields.center_id = req.center_id || req.user?.center_id;
      
      if (req.files && req.files.Certificate && req.files.Certificate.length > 0) {
        const file = req.files.Certificate[0];
        const buffer = await fs.readFile(file.path);
        fields.Certificate = buffer;
        fields.Certificate_Filename = file.originalname;
        fields.Certificate_Mime = file.mimetype;
        fields.Certificate_Size = file.size;
        fields.Certificate_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Nikah_Image && req.files.Nikah_Image.length > 0) {
        const file = req.files.Nikah_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.Nikah_Image = buffer;
        fields.Nikah_Image_Filename = file.originalname;
        fields.Nikah_Image_Mime = file.mimetype;
        fields.Nikah_Image_Size = file.size;
        fields.Nikah_Image_Updated_At = new Date().toISOString();
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
        fields.Certificate = buffer;
        fields.Certificate_Filename = file.originalname;
        fields.Certificate_Mime = file.mimetype;
        fields.Certificate_Size = file.size;
        fields.Certificate_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Nikah_Image && req.files.Nikah_Image.length > 0) {
        const file = req.files.Nikah_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.Nikah_Image = buffer;
        fields.Nikah_Image_Filename = file.originalname;
        fields.Nikah_Image_Mime = file.mimetype;
        fields.Nikah_Image_Size = file.size;
        fields.Nikah_Image_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await nikahBonusModel.update(req.params.id, fields, centerId, isSuperAdmin); 
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
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const deleted = await nikahBonusModel.delete(req.params.id, centerId, isSuperAdmin); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  downloadCertificate: async (req, res) => {
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const record = await nikahBonusModel.getById(req.params.id, centerId, isSuperAdmin);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Certificate) return res.status(404).send("No certificate found");
  
      const mimeType = record.Certificate_Mime || "application/pdf";
      const filename = record.Certificate_Filename || "certificate";
  
      let buffer = record.Certificate;
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
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const record = await nikahBonusModel.getById(req.params.id, centerId, isSuperAdmin);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Nikah_Image) return res.status(404).send("No image found");
  
      const mimeType = record.Nikah_Image_Mime || "image/jpeg";
      const filename = record.Nikah_Image_Filename || "nikah_image";
  
      let buffer = record.Nikah_Image;
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

