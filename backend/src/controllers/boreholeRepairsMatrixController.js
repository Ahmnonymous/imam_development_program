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
      fields.updated_by = username;
      delete fields.created_by;
      
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
};

module.exports = boreholeRepairsMatrixController;

