const boreholeConstructionTasksModel = require('../models/boreholeConstructionTasksModel');
const fs = require('fs').promises;

const boreholeConstructionTasksController = {
  getAll: async (req, res) => { 
    try {
      const boreholeId = req.query.borehole_id || null;
      const data = await boreholeConstructionTasksModel.getAll(boreholeId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await boreholeConstructionTasksModel.getById(req.params.id); 
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
      } else {
        fields.borehole_id = null;
      }
      
      if (fields.task !== undefined && fields.task !== null && fields.task !== '') {
        fields.task = parseInt(fields.task);
      } else {
        fields.task = null;
      }
      
      if (fields.appointed_supplier !== undefined && fields.appointed_supplier !== null && fields.appointed_supplier !== '') {
        fields.appointed_supplier = parseInt(fields.appointed_supplier);
      } else {
        fields.appointed_supplier = null;
      }
      
      if (fields.rating !== undefined && fields.rating !== null && fields.rating !== '') {
        fields.rating = parseInt(fields.rating);
      } else {
        fields.rating = null;
      }
      
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id);
      } else {
        fields.status_id = null;
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
      
      if (req.files && req.files.Invoice && req.files.Invoice.length > 0) {
        const file = req.files.Invoice[0];
        const buffer = await fs.readFile(file.path);
        fields.invoice = buffer;
        fields.invoice_filename = file.originalname;
        fields.invoice_mime = file.mimetype;
        fields.invoice_size = file.size;
        await fs.unlink(file.path);
      }
      
      const data = await boreholeConstructionTasksModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Borehole_Construction_Tasks: " + err.message}); 
    } 
  },
  
  update: async (req, res) => {
    try {
      // Build fields object explicitly - only include allowed fields that are actually provided
      const fields = {};
      
      // List of allowed updateable fields
      const allowedFields = [
        'task', 'appointed_supplier', 'appointed_date', 'estimated_completion_date',
        'warranty', 'cost', 'rating', 'status_id', 'comments', 'updated_by',
        'invoice', 'invoice_filename', 'invoice_mime', 'invoice_size'
      ];
      
      // Handle integer fields - convert empty strings to null
      if (req.body.task !== undefined) {
        fields.task = (req.body.task !== null && req.body.task !== '') ? parseInt(req.body.task) : null;
      }
      
      if (req.body.appointed_supplier !== undefined) {
        fields.appointed_supplier = (req.body.appointed_supplier !== null && req.body.appointed_supplier !== '') ? parseInt(req.body.appointed_supplier) : null;
      }
      
      if (req.body.rating !== undefined) {
        fields.rating = (req.body.rating !== null && req.body.rating !== '') ? parseInt(req.body.rating) : null;
      }
      
      if (req.body.status_id !== undefined) {
        fields.status_id = (req.body.status_id !== null && req.body.status_id !== '') ? parseInt(req.body.status_id) : null;
      }
      
      // Handle decimal fields - convert empty strings to null
      if (req.body.cost !== undefined) {
        fields.cost = (req.body.cost !== null && req.body.cost !== '') ? parseFloat(req.body.cost) : null;
      }
      
      // Handle text/date fields - only include if provided (not undefined)
      if (req.body.appointed_date !== undefined) {
        fields.appointed_date = req.body.appointed_date || null;
      }
      if (req.body.estimated_completion_date !== undefined) {
        fields.estimated_completion_date = req.body.estimated_completion_date || null;
      }
      if (req.body.warranty !== undefined) {
        fields.warranty = req.body.warranty || null;
      }
      if (req.body.comments !== undefined) {
        fields.comments = req.body.comments || null;
      }
      
      // Always set updated_by (don't use req.body.updated_by to avoid conflicts)
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      
      // Handle file upload if provided
      if (req.files && req.files.Invoice && req.files.Invoice.length > 0) {
        const file = req.files.Invoice[0];
        const buffer = await fs.readFile(file.path);
        fields.invoice = buffer;
        fields.invoice_filename = file.originalname;
        fields.invoice_mime = file.mimetype;
        fields.invoice_size = file.size;
        await fs.unlink(file.path);
      }
      
      // Remove any fields that aren't in the allowed list (safety check)
      Object.keys(fields).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete fields[key];
        }
      });
      
      const data = await boreholeConstructionTasksModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Borehole_Construction_Tasks: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => {
    try {
      const deleted = await boreholeConstructionTasksModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    }
  },

  viewInvoice: async (req, res) => {
    try {
      const pool = require('../config/db');
      const query = `SELECT invoice, invoice_filename, invoice_mime, invoice_size FROM borehole_construction_tasks WHERE id = $1`;
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
};

module.exports = boreholeConstructionTasksController;

