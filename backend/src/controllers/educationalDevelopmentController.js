const educationalDevelopmentModel = require('../models/educationalDevelopmentModel');
const fs = require('fs').promises;

const educationalDevelopmentController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await educationalDevelopmentModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await educationalDevelopmentModel.getById(req.params.id); 
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
      
      if (req.files && req.files.Brochure && req.files.Brochure.length > 0) {
        const file = req.files.Brochure[0];
        const buffer = await fs.readFile(file.path);
        fields.brochure = buffer;
        fields.brochure_filename = file.originalname;
        fields.brochure_mime = file.mimetype;
        fields.brochure_size = file.size;
        await fs.unlink(file.path);
      }
      if (req.files && req.files.Invoice && req.files.Invoice.length > 0) {
        const file = req.files.Invoice[0];
        const buffer = await fs.readFile(file.path);
        fields.invoice = buffer;
        fields.invoice_filename = file.originalname;
        fields.invoice_mime = file.mimetype;
        fields.invoice_size = file.size;
        await fs.unlink(file.path);
      }
      
      const data = await educationalDevelopmentModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Educational_Development: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (!req.files || !req.files.Brochure || req.files.Brochure.length === 0) {
        delete fields.brochure;
        delete fields.brochure_filename;
        delete fields.brochure_mime;
        delete fields.brochure_size;
      } else {
        const file = req.files.Brochure[0];
        const buffer = await fs.readFile(file.path);
        fields.brochure = buffer;
        fields.brochure_filename = file.originalname;
        fields.brochure_mime = file.mimetype;
        fields.brochure_size = file.size;
        await fs.unlink(file.path);
      }
      if (!req.files || !req.files.Invoice || req.files.Invoice.length === 0) {
        delete fields.invoice;
        delete fields.invoice_filename;
        delete fields.invoice_mime;
        delete fields.invoice_size;
      } else {
        const file = req.files.Invoice[0];
        const buffer = await fs.readFile(file.path);
        fields.invoice = buffer;
        fields.invoice_filename = file.originalname;
        fields.invoice_mime = file.mimetype;
        fields.invoice_size = file.size;
        await fs.unlink(file.path);
      }
      
      Object.keys(fields).forEach(key => {
        if (fields[key] === undefined) {
          delete fields[key];
        }
      });
      
      const data = await educationalDevelopmentModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Educational_Development: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await educationalDevelopmentModel.delete(req.params.id); 
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
      const query = `SELECT certificate, certificate_filename, certificate_mime, certificate_size FROM Educational_Development WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.certificate && !record.certificate_filename) return res.status(404).send("No certificate found");
  
      const mimeType = record.certificate_mime || "application/pdf";
      const filename = record.certificate_filename || "certificate";
  
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

  downloadCertificate: async (req, res) => {
    try {
      const record = await educationalDevelopmentModel.getById(req.params.id);
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
        } else {
          throw new Error("Unknown certificate encoding");
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

  viewBrochure: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT brochure, brochure_filename, brochure_mime, brochure_size FROM educational_development WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      if (!record) return res.status(404).send("Record not found");
      if (!record.brochure && !record.brochure_filename) return res.status(404).send("No brochure found");
      const mimeType = record.brochure_mime || "application/pdf";
      const filename = record.brochure_filename || "brochure";
      if (record.brochure_filename && !record.brochure) return res.status(404).send("Brochure file data not found");
      let buffer = record.brochure;
      if (!buffer) return res.status(404).send("No brochure found");
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          buffer = buffer.startsWith("\\x") ? Buffer.from(buffer.slice(2), "hex") : Buffer.from(buffer, "base64");
        } else throw new Error("Invalid brochure data type");
      }
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing brochure:", err);
      res.status(500).json({ error: "Error viewing brochure: " + err.message });
    }
  },

  viewInvoice: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT invoice, invoice_filename, invoice_mime, invoice_size FROM educational_development WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      if (!record) return res.status(404).send("Record not found");
      if (!record.invoice && !record.invoice_filename) return res.status(404).send("No invoice found");
      const mimeType = record.invoice_mime || "application/pdf";
      const filename = record.invoice_filename || "invoice";
      if (record.invoice_filename && !record.invoice) return res.status(404).send("Invoice file data not found");
      let buffer = record.invoice;
      if (!buffer) return res.status(404).send("No invoice found");
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          buffer = buffer.startsWith("\\x") ? Buffer.from(buffer.slice(2), "hex") : Buffer.from(buffer, "base64");
        } else throw new Error("Invalid invoice data type");
      }
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing invoice:", err);
      res.status(500).json({ error: "Error viewing invoice: " + err.message });
    }
  },
};

module.exports = educationalDevelopmentController;

