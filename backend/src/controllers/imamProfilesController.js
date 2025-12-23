const imamProfilesModel = require('../models/imamProfilesModel');

const imamProfilesController = {
  getAll: async (req, res) => { 
    try {
      const data = await imamProfilesModel.getAll(); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await imamProfilesModel.getById(req.params.id); 
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
      
      const data = await imamProfilesModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Imam_Profiles: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      const data = await imamProfilesModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Imam_Profiles: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await imamProfilesModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = imamProfilesController;

