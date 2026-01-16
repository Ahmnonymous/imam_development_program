const pearlsOfWisdomModel = require('../models/pearlsOfWisdomModel');
const { afterCreate } = require('../utils/modelHelpers');

const pearlsOfWisdomController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await pearlsOfWisdomModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await pearlsOfWisdomModel.getById(req.params.id); 
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
      
      const data = await pearlsOfWisdomModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('Pearls_Of_Wisdom', data);
      
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Pearls_Of_Wisdom: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      const data = await pearlsOfWisdomModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Pearls_Of_Wisdom: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await pearlsOfWisdomModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = pearlsOfWisdomController;

