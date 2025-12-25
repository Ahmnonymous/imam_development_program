const medicalReimbursementModel = require('../models/medicalReimbursementModel');
const fs = require('fs').promises;

const medicalReimbursementController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await medicalReimbursementModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await medicalReimbursementModel.getById(req.params.id); 
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
      
      if (req.files && req.files.Receipt && req.files.Receipt.length > 0) {
        const file = req.files.Receipt[0];
        const buffer = await fs.readFile(file.path);
        fields.receipt = buffer;
        fields.receipt_filename = file.originalname;
        fields.receipt_mime = file.mimetype;
        fields.receipt_size = file.size;
        fields.receipt_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Supporting_Docs && req.files.Supporting_Docs.length > 0) {
        const file = req.files.Supporting_Docs[0];
        const buffer = await fs.readFile(file.path);
        fields.supporting_docs = buffer;
        fields.supporting_docs_filename = file.originalname;
        fields.supporting_docs_mime = file.mimetype;
        fields.supporting_docs_size = file.size;
        fields.supporting_docs_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await medicalReimbursementModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Medical_Reimbursement: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Receipt && req.files.Receipt.length > 0) {
        const file = req.files.Receipt[0];
        const buffer = await fs.readFile(file.path);
        fields.receipt = buffer;
        fields.receipt_filename = file.originalname;
        fields.receipt_mime = file.mimetype;
        fields.receipt_size = file.size;
        fields.receipt_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Supporting_Docs && req.files.Supporting_Docs.length > 0) {
        const file = req.files.Supporting_Docs[0];
        const buffer = await fs.readFile(file.path);
        fields.supporting_docs = buffer;
        fields.supporting_docs_filename = file.originalname;
        fields.supporting_docs_mime = file.mimetype;
        fields.supporting_docs_size = file.size;
        fields.supporting_docs_updated_at = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await medicalReimbursementModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Medical_Reimbursement: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await medicalReimbursementModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  viewReceipt: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT receipt, receipt_filename, receipt_mime, receipt_size FROM medical_reimbursement WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.receipt && !record.receipt_filename) return res.status(404).send("No receipt found");
  
      const mimeType = record.receipt_mime || "application/pdf";
      const filename = record.receipt_filename || "receipt";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.receipt_filename && !record.receipt) {
        return res.status(404).send("Receipt file data not found in database");
      }
  
      let buffer = record.receipt;
      
      if (!buffer) {
        return res.status(404).send("No receipt found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown receipt encoding");
          }
        } else {
          throw new Error("Invalid receipt data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Receipt buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing receipt:", err);
      res.status(500).json({ error: "Error viewing receipt: " + err.message });
    }
  },

  viewSupportingDocs: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT supporting_docs, supporting_docs_filename, supporting_docs_mime, supporting_docs_size FROM medical_reimbursement WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.supporting_docs && !record.supporting_docs_filename) return res.status(404).send("No supporting documents found");
  
      const mimeType = record.supporting_docs_mime || "application/pdf";
      const filename = record.supporting_docs_filename || "supporting_docs";
  
      // If filename exists but BYTEA is null, the file data is missing
      if (record.supporting_docs_filename && !record.supporting_docs) {
        return res.status(404).send("Supporting documents file data not found in database");
      }
  
      let buffer = record.supporting_docs;
      
      if (!buffer) {
        return res.status(404).send("No supporting documents found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown supporting docs encoding");
          }
        } else {
          throw new Error("Invalid supporting docs data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Supporting docs buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing supporting docs:", err);
      res.status(500).json({ error: "Error viewing supporting docs: " + err.message });
    }
  },

  downloadReceipt: async (req, res) => {
    try {
      const record = await medicalReimbursementModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.receipt) return res.status(404).send("No receipt found");
  
      const mimeType = record.receipt_mime || "application/pdf";
      const filename = record.receipt_filename || "receipt";
  
      let buffer = record.receipt;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown receipt encoding");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading receipt: " + err.message });
    }
  },

  downloadSupportingDocs: async (req, res) => {
    try {
      const record = await medicalReimbursementModel.getById(req.params.id);
      if (!record) return res.status(404).send("Record not found");
      if (!record.supporting_docs) return res.status(404).send("No supporting documents found");
  
      const mimeType = record.supporting_docs_mime || "application/pdf";
      const filename = record.supporting_docs_filename || "supporting_docs";
  
      let buffer = record.supporting_docs;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown supporting docs encoding");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading supporting docs: " + err.message });
    }
  },
};

module.exports = medicalReimbursementController;

