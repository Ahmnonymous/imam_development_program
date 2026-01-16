const jumuahAudioKhutbahModel = require('../models/jumuahAudioKhutbahModel');
const { afterCreate } = require('../utils/modelHelpers');
const fs = require('fs').promises;

const jumuahAudioKhutbahController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await jumuahAudioKhutbahModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await jumuahAudioKhutbahModel.getById(req.params.id); 
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
      if (fields.language === '' || fields.language === undefined) {
        fields.language = null;
      } else if (fields.language !== null && typeof fields.language === 'string') {
        const parsed = parseInt(fields.language, 10);
        fields.language = isNaN(parsed) ? null : parsed;
      }
      
      if (req.files && req.files.Audio && req.files.Audio.length > 0) {
        const file = req.files.Audio[0];
        const buffer = await fs.readFile(file.path);
        fields.audio = buffer;
        fields.audio_filename = file.originalname;
        fields.audio_mime = file.mimetype;
        fields.audio_size = file.size;
        fields.audio_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await jumuahAudioKhutbahModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('Jumuah_Audio_Khutbah', data);
      
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
      
      // Convert empty strings to null for nullable bigint fields
      if (fields.language === '' || fields.language === undefined) {
        fields.language = null;
      } else if (fields.language !== null && typeof fields.language === 'string') {
        const parsed = parseInt(fields.language, 10);
        fields.language = isNaN(parsed) ? null : parsed;
      }
      
      if (req.files && req.files.Audio && req.files.Audio.length > 0) {
        const file = req.files.Audio[0];
        const buffer = await fs.readFile(file.path);
        fields.audio = buffer;
        fields.audio_filename = file.originalname;
        fields.audio_mime = file.mimetype;
        fields.audio_size = file.size;
        fields.audio_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await jumuahAudioKhutbahModel.update(req.params.id, fields); 
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
      const deleted = await jumuahAudioKhutbahModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewAudio: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT audio, audio_filename, audio_mime, audio_size FROM jumuah_audio_khutbah WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.audio && !record.audio_filename) return res.status(404).send("No audio file found");
  
      const mimeType = record.audio_mime || "audio/mpeg";
      const filename = record.audio_filename || "audio";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.audio_filename && !record.audio) {
        return res.status(404).send("Audio file data not found in database");
      }
  
      let buffer = record.audio;
      
      if (!buffer) {
        return res.status(404).send("No audio file found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown audio encoding");
          }
        } else {
          throw new Error("Invalid audio data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Audio buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing audio:", err);
      res.status(500).json({ error: "Error viewing audio: " + err.message });
    }
  },

  downloadAudio: async (req, res) => {
    try {
      const record = await jumuahAudioKhutbahModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.audio) return res.status(404).send("No audio file found");
  
      const mimeType = record.audio_mime || "audio/mpeg";
      const filename = record.audio_filename || "audio";
  
      let buffer = record.audio;
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

