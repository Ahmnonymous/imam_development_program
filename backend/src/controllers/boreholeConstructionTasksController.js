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
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Invoice && req.files.Invoice.length > 0) {
        const file = req.files.Invoice[0];
        const buffer = await fs.readFile(file.path);
        fields.invoice = buffer;
        fields.invoice_filename = file.originalname;
        fields.invoice_mime = file.mimetype;
        fields.invoice_size = file.size;
        await fs.unlink(file.path);
      }
      
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
};

module.exports = boreholeConstructionTasksController;

