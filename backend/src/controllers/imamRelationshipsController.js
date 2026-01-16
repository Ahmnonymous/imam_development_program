const imamRelationshipsModel = require('../models/imamRelationshipsModel');

const imamRelationshipsController = {
  getAll: async (req, res) => { 
    try { 
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await imamRelationshipsModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try { 
      const data = await imamRelationshipsModel.getById(req.params.id); 
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
      
      // Convert empty strings to null for nullable bigint fields
      const bigintFields = ['Relationship_Type', 'Employment_Status', 'Gender', 'Highest_Education', 'Health_Condition'];
      bigintFields.forEach(fieldName => {
        if (fields[fieldName] === '' || fields[fieldName] === undefined) {
          fields[fieldName] = null;
        } else if (fields[fieldName] !== null && typeof fields[fieldName] === 'string') {
          const parsed = parseInt(fields[fieldName], 10);
          fields[fieldName] = isNaN(parsed) ? null : parsed;
        }
      });
      
      const data = await imamRelationshipsModel.create(fields);
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  update: async (req, res) => {
    try {
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      // Convert empty strings to null for nullable bigint fields
      const bigintFields = ['Relationship_Type', 'Employment_Status', 'Gender', 'Highest_Education', 'Health_Condition'];
      bigintFields.forEach(fieldName => {
        if (fields[fieldName] === '' || fields[fieldName] === undefined) {
          fields[fieldName] = null;
        } else if (fields[fieldName] !== null && typeof fields[fieldName] === 'string') {
          const parsed = parseInt(fields[fieldName], 10);
          fields[fieldName] = isNaN(parsed) ? null : parsed;
        }
      });
      
      const data = await imamRelationshipsModel.update(req.params.id, fields);
      if (!data) {
        return res.status(404).json({ error: "Not found" });
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await imamRelationshipsModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({ error: "Not found" });
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = imamRelationshipsController;





