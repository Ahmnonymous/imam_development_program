const hardshipReliefModel = require('../models/hardshipReliefModel');

const hardshipReliefController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await hardshipReliefModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await hardshipReliefModel.getById(req.params.id); 
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
      if (fields.request_for !== undefined && fields.request_for !== null && fields.request_for !== '') {
        fields.request_for = parseInt(fields.request_for);
      } else {
        fields.request_for = null;
      }
      
      if (fields.is_muslim !== undefined && fields.is_muslim !== null && fields.is_muslim !== '') {
        fields.is_muslim = parseInt(fields.is_muslim);
      } else {
        fields.is_muslim = null;
      }
      
      if (fields.area_of_residence !== undefined && fields.area_of_residence !== null && fields.area_of_residence !== '') {
        fields.area_of_residence = parseInt(fields.area_of_residence);
      } else {
        fields.area_of_residence = null;
      }
      
      if (fields.has_disabilities !== undefined && fields.has_disabilities !== null && fields.has_disabilities !== '') {
        fields.has_disabilities = parseInt(fields.has_disabilities);
      } else {
        fields.has_disabilities = null;
      }
      
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id) || 1;
      } else {
        fields.status_id = 1; // Default to Pending
      }
      
      // Handle decimal fields - convert empty strings to 0 (NOT NULL field)
      if (fields.amount_required_local_currency !== undefined && fields.amount_required_local_currency !== null && fields.amount_required_local_currency !== '') {
        fields.amount_required_local_currency = parseFloat(fields.amount_required_local_currency);
      } else {
        fields.amount_required_local_currency = 0; // Default to 0 for NOT NULL field
      }
      
      const username = req.user?.username || 'system';
      fields.created_by = username;
      fields.updated_by = username;
      
      const data = await hardshipReliefModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Hardship_Relief: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      // Handle integer fields - convert empty strings to null
      if (fields.request_for !== undefined && fields.request_for !== null && fields.request_for !== '') {
        fields.request_for = parseInt(fields.request_for);
      } else {
        fields.request_for = null;
      }
      
      if (fields.is_muslim !== undefined && fields.is_muslim !== null && fields.is_muslim !== '') {
        fields.is_muslim = parseInt(fields.is_muslim);
      } else {
        fields.is_muslim = null;
      }
      
      if (fields.area_of_residence !== undefined && fields.area_of_residence !== null && fields.area_of_residence !== '') {
        fields.area_of_residence = parseInt(fields.area_of_residence);
      } else {
        fields.area_of_residence = null;
      }
      
      if (fields.has_disabilities !== undefined && fields.has_disabilities !== null && fields.has_disabilities !== '') {
        fields.has_disabilities = parseInt(fields.has_disabilities);
      } else {
        fields.has_disabilities = null;
      }
      
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id) || 1;
      }
      
      // Handle decimal fields - convert empty strings to 0 (NOT NULL field)
      if (fields.amount_required_local_currency !== undefined && fields.amount_required_local_currency !== null && fields.amount_required_local_currency !== '') {
        fields.amount_required_local_currency = parseFloat(fields.amount_required_local_currency);
      } else {
        fields.amount_required_local_currency = 0; // Default to 0 for NOT NULL field
      }
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      const data = await hardshipReliefModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Hardship_Relief: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await hardshipReliefModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = hardshipReliefController;

