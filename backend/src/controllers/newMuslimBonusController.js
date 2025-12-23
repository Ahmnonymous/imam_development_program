const newMuslimBonusModel = require('../models/newMuslimBonusModel');

const newMuslimBonusController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await newMuslimBonusModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await newMuslimBonusModel.getById(req.params.id); 
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
      
      const data = await newMuslimBonusModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in New_Muslim_Bonus: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      const data = await newMuslimBonusModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in New_Muslim_Bonus: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await newMuslimBonusModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = newMuslimBonusController;

