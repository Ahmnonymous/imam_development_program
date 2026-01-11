const boreholeRepairsMatrixModel = require('../models/boreholeRepairsMatrixModel');
const fs = require('fs').promises;

const boreholeRepairsMatrixController = {
  getAll: async (req, res) => { 
    try {
      const boreholeId = req.query.borehole_id || null;
      const data = await boreholeRepairsMatrixModel.getAll(boreholeId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await boreholeRepairsMatrixModel.getById(req.params.id); 
      if(!data) return res.status(404).json({error: 'Not found'}); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  create: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      // Handle integer fields - convert empty strings to null
      if (fields.borehole_id !== undefined && fields.borehole_id !== null && fields.borehole_id !== '') {
        fields.borehole_id = parseInt(fields.borehole_id);
      }
      
      if (fields.supplier !== undefined && fields.supplier !== null && fields.supplier !== '') {
        fields.supplier = parseInt(fields.supplier);
      } else {
        fields.supplier = null;
      }
      
      // Handle decimal fields - convert empty strings to null
      if (fields.cost !== undefined && fields.cost !== null && fields.cost !== '') {
        fields.cost = parseFloat(fields.cost);
      } else {
        fields.cost = null;
      }
      
      const username = req.user?.username || 'system';
      fields.created_by = username;
      fields.updated_by = username;
      
      if (req.files && req.files.Task && req.files.Task.length > 0) {
        const file = req.files.Task[0];
        const buffer = await fs.readFile(file.path);
        fields.task = buffer;
        fields.task_filename = file.originalname;
        fields.task_mime = file.mimetype;
        fields.task_size = file.size;
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
      
      if (req.files && req.files.Parts_Image && req.files.Parts_Image.length > 0) {
        const file = req.files.Parts_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.parts_image = buffer;
        fields.parts_image_filename = file.originalname;
        fields.parts_image_mime = file.mimetype;
        fields.parts_image_size = file.size;
        await fs.unlink(file.path);
      }
      
      const data = await boreholeRepairsMatrixModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Borehole_Repairs_Matrix: " + err.message}); 
    } 
  },
  
  update: async (req, res) => {
    try {
      // Build fields object explicitly - only include allowed fields
      const fields = {};
      
      // List of allowed updateable fields
      const allowedFields = [
        'component', 'supplier', 'warranty', 'cost', 'notes_comments', 'datestamp', 'updated_by',
        'task', 'task_filename', 'task_mime', 'task_size',
        'invoice', 'invoice_filename', 'invoice_mime', 'invoice_size',
        'parts_image', 'parts_image_filename', 'parts_image_mime', 'parts_image_size'
      ];
      
      // Handle text fields
      if (req.body.component !== undefined) {
        fields.component = req.body.component || null;
      }
      if (req.body.warranty !== undefined) {
        fields.warranty = req.body.warranty || null;
      }
      if (req.body.notes_comments !== undefined) {
        fields.notes_comments = req.body.notes_comments || null;
      }
      if (req.body.datestamp !== undefined) {
        fields.datestamp = req.body.datestamp || null;
      }
      
      // Handle integer fields - convert empty strings to null
      if (req.body.supplier !== undefined) {
        fields.supplier = (req.body.supplier !== null && req.body.supplier !== '') ? parseInt(req.body.supplier) : null;
      }
      
      // Handle decimal fields - convert empty strings to null
      if (req.body.cost !== undefined) {
        fields.cost = (req.body.cost !== null && req.body.cost !== '') ? parseFloat(req.body.cost) : null;
      }
      
      // Always set updated_by (don't use req.body.updated_by to avoid conflicts)
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      
      // Handle file uploads if provided
      if (req.files && req.files.Task && req.files.Task.length > 0) {
        const file = req.files.Task[0];
        const buffer = await fs.readFile(file.path);
        fields.task = buffer;
        fields.task_filename = file.originalname;
        fields.task_mime = file.mimetype;
        fields.task_size = file.size;
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
      
      if (req.files && req.files.Parts_Image && req.files.Parts_Image.length > 0) {
        const file = req.files.Parts_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.parts_image = buffer;
        fields.parts_image_filename = file.originalname;
        fields.parts_image_mime = file.mimetype;
        fields.parts_image_size = file.size;
        await fs.unlink(file.path);
      }
      
      // Remove any fields that aren't in the allowed list (safety check)
      Object.keys(fields).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete fields[key];
        }
      });
      
      const data = await boreholeRepairsMatrixModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Borehole_Repairs_Matrix: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => {
    try {
      const deleted = await boreholeRepairsMatrixModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    }
  },

  viewTask: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT task, task_filename, task_mime, task_size FROM borehole_repairs_matrix WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.task && !record.task_filename) return res.status(404).send("No task found");
  
      const mimeType = record.task_mime || "application/pdf";
      const filename = record.task_filename || "task";
  
      if (record.task_filename && !record.task) {
        return res.status(404).send("Task file data not found in database");
      }
  
      let buffer = record.task;
      
      if (!buffer) {
        return res.status(404).send("No task found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown task encoding");
          }
        } else {
          throw new Error("Invalid task data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Task buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing task:", err);
      res.status(500).json({ error: "Error viewing task: " + err.message });
    }
  },

  viewInvoice: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT invoice, invoice_filename, invoice_mime, invoice_size FROM borehole_repairs_matrix WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.invoice && !record.invoice_filename) return res.status(404).send("No invoice found");
  
      const mimeType = record.invoice_mime || "application/pdf";
      const filename = record.invoice_filename || "invoice";
  
      if (record.invoice_filename && !record.invoice) {
        return res.status(404).send("Invoice file data not found in database");
      }
  
      let buffer = record.invoice;
      
      if (!buffer) {
        return res.status(404).send("No invoice found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown invoice encoding");
          }
        } else {
          throw new Error("Invalid invoice data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Invoice buffer is empty or corrupted");
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

  viewPartsImage: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT parts_image, parts_image_filename, parts_image_mime, parts_image_size FROM borehole_repairs_matrix WHERE id = $1`;
      const res_db = await pool.query(query, [req.params.id]);
      const record = res_db.rows[0];
      
      if (!record) return res.status(404).send("Record not found");
      if (!record.parts_image && !record.parts_image_filename) return res.status(404).send("No parts image found");
  
      const mimeType = record.parts_image_mime || "image/jpeg";
      const filename = record.parts_image_filename || "parts_image";
  
      if (record.parts_image_filename && !record.parts_image) {
        return res.status(404).send("Parts image file data not found in database");
      }
  
      let buffer = record.parts_image;
      
      if (!buffer) {
        return res.status(404).send("No parts image found");
      }
      
      if (!Buffer.isBuffer(buffer)) {
        if (typeof buffer === "string") {
          if (buffer.startsWith("\\x")) {
            buffer = Buffer.from(buffer.slice(2), "hex");
          } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
            buffer = Buffer.from(buffer, "base64");
          } else {
            throw new Error("Unknown parts image encoding");
          }
        } else {
          throw new Error("Invalid parts image data type");
        }
      }
  
      if (!buffer || !buffer.length) {
        return res.status(500).send("Parts image buffer is empty or corrupted");
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
  
      res.end(buffer, "binary");
    } catch (err) {
      console.error("Error viewing parts image:", err);
      res.status(500).json({ error: "Error viewing parts image: " + err.message });
    }
  },
};

module.exports = boreholeRepairsMatrixController;

