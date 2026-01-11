const ticketsModel = require('../models/ticketsModel');
const fs = require('fs').promises;

const ticketsController = {
  getAll: async (req, res) => { 
    try {
      const data = await ticketsModel.getAll(); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await ticketsModel.getById(req.params.id); 
      if(!data) return res.status(404).json({error: 'Not found'}); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  create: async (req, res) => {
    try { 
      const fields = { ...req.body };
      
      // Map frontend field names to database column names
      if (fields.classification !== undefined && fields.classification !== null && fields.classification !== '') {
        fields.classification_id = parseInt(fields.classification);
      } else {
        fields.classification_id = null;
      }
      delete fields.classification;
      
      if (fields.status !== undefined) {
        fields.status_id = fields.status;
        delete fields.status;
      }
      // Handle status_id from FormData (may be string)
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id) || 1;
      } else {
        fields.status_id = 1; // Default to Pending
      }
      
      if (fields.allocated_to !== undefined && fields.allocated_to !== null && fields.allocated_to !== '') {
        fields.allocated_to = parseInt(fields.allocated_to);
      } else {
        fields.allocated_to = null;
      }
      
      if (fields.created_time) {
        fields.created_at = fields.created_time;
        delete fields.created_time;
      }
      if (fields.closed_time) {
        fields.closed_at = fields.closed_time;
        delete fields.closed_time;
      }
      
      const username = req.user?.username || 'system';
      fields.created_by = username;
      fields.updated_by = username;
      
      if (req.files && req.files.Media && req.files.Media.length > 0) {
        const file = req.files.Media[0];
        const buffer = await fs.readFile(file.path);
        fields.media = buffer;
        fields.media_filename = file.originalname;
        fields.media_mime = file.mimetype;
        fields.media_size = file.size;
        await fs.unlink(file.path);
      }
      
      const data = await ticketsModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Tickets: " + err.message}); 
    } 
  },
  
  update: async (req, res) => {
    try { 
      const fields = { ...req.body };
      
      // Map frontend field names to database column names
      if (fields.classification !== undefined && fields.classification !== null && fields.classification !== '') {
        fields.classification_id = parseInt(fields.classification);
      } else {
        fields.classification_id = null;
      }
      delete fields.classification;
      
      if (fields.status !== undefined) {
        fields.status_id = fields.status;
        delete fields.status;
      }
      // Handle status_id from FormData (may be string)
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id) || 1;
      }
      
      if (fields.allocated_to !== undefined && fields.allocated_to !== null && fields.allocated_to !== '') {
        fields.allocated_to = parseInt(fields.allocated_to);
      } else {
        fields.allocated_to = null;
      }
      
      if (fields.created_time) {
        fields.created_at = fields.created_time;
        delete fields.created_time;
      }
      if (fields.closed_time) {
        fields.closed_at = fields.closed_time;
        delete fields.closed_time;
      }
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      // Remove file-related fields if no file is provided
      if (!req.files || !req.files.Media || req.files.Media.length === 0) {
        delete fields.media;
        delete fields.media_filename;
        delete fields.media_mime;
        delete fields.media_size;
      } else {
        const file = req.files.Media[0];
        const buffer = await fs.readFile(file.path);
        fields.media = buffer;
        fields.media_filename = file.originalname;
        fields.media_mime = file.mimetype;
        fields.media_size = file.size;
        await fs.unlink(file.path);
      }
      
      // Clean up undefined values
      Object.keys(fields).forEach(key => {
        if (fields[key] === undefined) {
          delete fields[key];
        }
      });
      
      const data = await ticketsModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'});
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Tickets: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await ticketsModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = ticketsController;

