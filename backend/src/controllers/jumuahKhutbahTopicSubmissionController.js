const jumuahKhutbahTopicSubmissionModel = require('../models/jumuahKhutbahTopicSubmissionModel');
const { afterCreate } = require('../utils/modelHelpers');

const jumuahKhutbahTopicSubmissionController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await jumuahKhutbahTopicSubmissionModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await jumuahKhutbahTopicSubmissionModel.getById(req.params.id); 
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
      
      const data = await jumuahKhutbahTopicSubmissionModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('Jumuah_Khutbah_Topic', data);
      
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Jumuah_Khutbah_Topic: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      const data = await jumuahKhutbahTopicSubmissionModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Jumuah_Khutbah_Topic: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await jumuahKhutbahTopicSubmissionModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = jumuahKhutbahTopicSubmissionController;

