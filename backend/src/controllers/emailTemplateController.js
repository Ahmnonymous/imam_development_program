const emailTemplateModel = require('../models/emailTemplateModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const emailTemplateController = {
  getAll: async (req, res) => {
    try {
      const data = await emailTemplateModel.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await emailTemplateModel.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getByType: async (req, res) => {
    try {
      const { templateType } = req.params;
      const data = await emailTemplateModel.getByType(templateType);
      if (!data) return res.status(404).json({ error: 'Template not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const fields = { ...req.body };
      const username = req.user?.username || 'system';
      fields.created_by = username;
      fields.updated_by = username;

      // Handle image upload if present
      if (req.file) {
        fields.background_image = req.file.buffer;
        fields.background_image_filename = req.file.originalname;
        fields.background_image_mime = req.file.mimetype;
        fields.background_image_size = req.file.size;
        fields.background_image_updated_at = new Date();
      }

      // Parse available_variables if it's a string
      if (typeof fields.available_variables === 'string') {
        try {
          fields.available_variables = JSON.parse(fields.available_variables);
        } catch (e) {
          // If it's not valid JSON, keep as string
        }
      }

      const data = await emailTemplateModel.create(fields);
      
      // Generate and update show_link if image was uploaded
      if (req.file && data.id) {
        // Use production URL in production, localhost in development
        const API_BASE_URL = process.env.NODE_ENV === 'production' 
          ? (process.env.API_BASE_URL || process.env.PRODUCTION_API_URL || 'https://imamportal.com')
          : (process.env.API_BASE_URL || 'http://localhost:5000');
        const showLink = `${API_BASE_URL}/api/emailTemplates/${data.id}/view-image`;
        const updatedData = await emailTemplateModel.update(data.id, { background_image_show_link: showLink });
        // Return updated data with show_link
        res.status(201).json(updatedData || { ...data, background_image_show_link: showLink });
      } else {
        res.status(201).json(data);
      }
    } catch (err) {
      res.status(500).json({ error: "Error creating email template: " + err.message });
    }
  },

  update: async (req, res) => {
    try {
      const fields = { ...req.body };
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;

      // Handle image upload if present
      if (req.file) {
        fields.background_image = req.file.buffer;
        fields.background_image_filename = req.file.originalname;
        fields.background_image_mime = req.file.mimetype;
        fields.background_image_size = req.file.size;
        fields.background_image_updated_at = new Date();
        
        // Generate show link - use production URL in production, localhost in development
        const API_BASE_URL = process.env.NODE_ENV === 'production' 
          ? (process.env.API_BASE_URL || process.env.PRODUCTION_API_URL || 'https://api.imamdp.org')
          : (process.env.API_BASE_URL || 'http://localhost:5000');
        fields.background_image_show_link = `${API_BASE_URL}/api/emailTemplates/${req.params.id}/view-image`;
      }

      // Parse available_variables if it's a string
      if (typeof fields.available_variables === 'string') {
        try {
          fields.available_variables = JSON.parse(fields.available_variables);
        } catch (e) {
          // If it's not valid JSON, keep as string
        }
      }

      const data = await emailTemplateModel.update(req.params.id, fields);
      if (!data) {
        return res.status(404).json({ error: 'Not found' });
      }
      
      // Ensure background_image_show_link is included in response
      // If no new image was uploaded but image exists, ensure show_link is set
      if (!req.file && data.background_image && !data.background_image_show_link) {
        const API_BASE_URL = process.env.NODE_ENV === 'production' 
          ? (process.env.API_BASE_URL || process.env.PRODUCTION_API_URL || 'https://api.imamdp.org')
          : (process.env.API_BASE_URL || 'http://localhost:5000');
        const showLink = `${API_BASE_URL}/api/emailTemplates/${req.params.id}/view-image`;
        const updatedData = await emailTemplateModel.update(req.params.id, { background_image_show_link: showLink });
        if (updatedData) {
          return res.json(updatedData);
        }
      }
      
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Error updating email template: " + err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await emailTemplateModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  viewImage: async (req, res) => {
    try {
      // Get raw image directly from database (bypass model conversion)
      const pool = require('../config/db');
      const query = `SELECT background_image, background_image_mime, background_image_filename, background_image_show_link FROM Email_Templates WHERE id = $1`;
      const result = await pool.query(query, [req.params.id]);
      
      if (!result.rows[0]) {
        return res.status(404).send("Template not found");
      }
      
      if (!result.rows[0].background_image) {
        return res.status(404).send("No image found");
      }

      let buffer = result.rows[0].background_image;
      
      // Ensure it's a Buffer
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

      const mimeType = result.rows[0].background_image_mime || "image/png";
      const filename = result.rows[0].background_image_filename || "image";

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);

      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing image:", err);
      res.status(500).json({ error: "Error viewing image: " + err.message });
    }
  },
};

// Export multer upload middleware
emailTemplateController.upload = upload.single('background_image');

module.exports = emailTemplateController;

