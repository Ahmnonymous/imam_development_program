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
      
      // Normalize field names to match database schema (lowercase for unquoted identifiers)
      const fieldMapping = {
        relationship_type: 'relationship_type',
        'Relationship_Type': 'relationship_type',
        employment_status: 'employment_status',
        'Employment_Status': 'employment_status',
        gender: 'gender',
        'Gender': 'gender',
        highest_education: 'highest_education',
        'Highest_Education': 'highest_education',
        health_condition: 'health_condition',
        'Health_Condition': 'health_condition',
        imam_profile_id: 'imam_profile_id',
        name: 'name',
        'Name': 'name',
        surname: 'surname',
        'Surname': 'surname',
        id_number: 'id_number',
        'ID_Number': 'id_number',
        date_of_birth: 'date_of_birth',
        'Date_of_Birth': 'date_of_birth',
      };
      
      const normalizedFields = {};
      Object.keys(fields).forEach(key => {
        const dbFieldName = fieldMapping[key] || fieldMapping[key.toLowerCase()] || key.toLowerCase();
        // Prevent duplicate columns
        if (!normalizedFields.hasOwnProperty(dbFieldName)) {
          normalizedFields[dbFieldName] = fields[key];
        }
      });
      
      const username = req.user?.username || 'system';
      normalizedFields.created_by = username;
      normalizedFields.updated_by = username;
      
      // Convert empty strings to null for nullable bigint fields
      const bigintFields = ['relationship_type', 'employment_status', 'gender', 'highest_education', 'health_condition'];
      bigintFields.forEach(fieldName => {
        if (normalizedFields[fieldName] === '' || normalizedFields[fieldName] === undefined) {
          normalizedFields[fieldName] = null;
        } else if (normalizedFields[fieldName] !== null && typeof normalizedFields[fieldName] === 'string') {
          const parsed = parseInt(normalizedFields[fieldName], 10);
          normalizedFields[fieldName] = isNaN(parsed) ? null : parsed;
        }
      });
      
      const data = await imamRelationshipsModel.create(normalizedFields);
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  update: async (req, res) => {
    try {
      const fields = { ...req.body };
      
      // Normalize field names to match database schema (lowercase for unquoted identifiers)
      const fieldMapping = {
        relationship_type: 'relationship_type',
        'Relationship_Type': 'relationship_type',
        employment_status: 'employment_status',
        'Employment_Status': 'employment_status',
        gender: 'gender',
        'Gender': 'gender',
        highest_education: 'highest_education',
        'Highest_Education': 'highest_education',
        health_condition: 'health_condition',
        'Health_Condition': 'health_condition',
        imam_profile_id: 'imam_profile_id',
        name: 'name',
        'Name': 'name',
        surname: 'surname',
        'Surname': 'surname',
        id_number: 'id_number',
        'ID_Number': 'id_number',
        date_of_birth: 'date_of_birth',
        'Date_of_Birth': 'date_of_birth',
        status_id: 'status_id',
      };
      
      const normalizedFields = {};
      Object.keys(fields).forEach(key => {
        const dbFieldName = fieldMapping[key] || fieldMapping[key.toLowerCase()] || key.toLowerCase();
        // Prevent duplicate columns
        if (!normalizedFields.hasOwnProperty(dbFieldName)) {
          normalizedFields[dbFieldName] = fields[key];
        }
      });
      
      const username = req.user?.username || 'system';
      normalizedFields.updated_by = username;
      delete normalizedFields.created_by;
      
      // Convert empty strings to null for nullable bigint fields
      const bigintFields = ['relationship_type', 'employment_status', 'gender', 'highest_education', 'health_condition'];
      bigintFields.forEach(fieldName => {
        if (normalizedFields[fieldName] === '' || normalizedFields[fieldName] === undefined) {
          normalizedFields[fieldName] = null;
        } else if (normalizedFields[fieldName] !== null && typeof normalizedFields[fieldName] === 'string') {
          const parsed = parseInt(normalizedFields[fieldName], 10);
          normalizedFields[fieldName] = isNaN(parsed) ? null : parsed;
        }
      });
      
      const data = await imamRelationshipsModel.update(req.params.id, normalizedFields);
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





