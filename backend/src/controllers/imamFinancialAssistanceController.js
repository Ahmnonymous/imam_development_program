const imamFinancialAssistanceModel = require('../models/imamFinancialAssistanceModel');
const { afterCreate } = require('../utils/modelHelpers');

const imamFinancialAssistanceController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await imamFinancialAssistanceModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await imamFinancialAssistanceModel.getById(req.params.id); 
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
      
      const data = await imamFinancialAssistanceModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('imam_financial_assistance', data);
      
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Imam_Financial_Assistance: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      const data = await imamFinancialAssistanceModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Imam_Financial_Assistance: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await imamFinancialAssistanceModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = imamFinancialAssistanceController;

