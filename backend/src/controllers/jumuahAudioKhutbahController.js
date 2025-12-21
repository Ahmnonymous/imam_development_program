const jumuahAudioKhutbahModel = require('../models/jumuahAudioKhutbahModel');
const fs = require('fs').promises;

const jumuahAudioKhutbahController = {
  getAll: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await jumuahAudioKhutbahModel.getAll(centerId, isSuperAdmin, imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await jumuahAudioKhutbahModel.getById(req.params.id, centerId, isSuperAdmin); 
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
      
      if (req.files && req.files.Audio && req.files.Audio.length > 0) {
        const file = req.files.Audio[0];
        const buffer = await fs.readFile(file.path);
        fields.Audio = buffer;
        fields.Audio_Filename = file.originalname;
        fields.Audio_Mime = file.mimetype;
        fields.Audio_Size = file.size;
        fields.Audio_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await jumuahAudioKhutbahModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Jumuah_Audio_Khutbah: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Audio && req.files.Audio.length > 0) {
        const file = req.files.Audio[0];
        const buffer = await fs.readFile(file.path);
        fields.Audio = buffer;
        fields.Audio_Filename = file.originalname;
        fields.Audio_Mime = file.mimetype;
        fields.Audio_Size = file.size;
        fields.Audio_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await jumuahAudioKhutbahModel.update(req.params.id, fields, centerId, isSuperAdmin); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Jumuah_Audio_Khutbah: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const deleted = await jumuahAudioKhutbahModel.delete(req.params.id, centerId, isSuperAdmin); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  downloadAudio: async (req, res) => {
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const record = await jumuahAudioKhutbahModel.getById(req.params.id, centerId, isSuperAdmin);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Audio) return res.status(404).send("No audio file found");
  
      const mimeType = record.Audio_Mime || "audio/mpeg";
      const filename = record.Audio_Filename || "audio";
  
      let buffer = record.Audio;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown audio encoding");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Audio buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer);
    } catch (err) {
      console.error("Error downloading audio:", err);
      res.status(500).json({ error: "Error downloading audio: " + err.message });
    }
  },
};

module.exports = jumuahAudioKhutbahController;

