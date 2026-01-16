const newMuslimBonusModel = require('../models/newMuslimBonusModel');
const { afterCreate } = require('../utils/modelHelpers');

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
      
      // Convert empty strings to null for nullable bigint fields
      if (fields.revert_gender === '' || fields.revert_gender === undefined) {
        fields.revert_gender = null;
      } else if (fields.revert_gender !== null && typeof fields.revert_gender === 'string') {
        const parsed = parseInt(fields.revert_gender, 10);
        fields.revert_gender = isNaN(parsed) ? null : parsed;
      }
      
      if (fields.revert_pack_requested === '' || fields.revert_pack_requested === undefined) {
        fields.revert_pack_requested = null;
      } else if (fields.revert_pack_requested !== null && typeof fields.revert_pack_requested === 'string') {
        const parsed = parseInt(fields.revert_pack_requested, 10);
        fields.revert_pack_requested = isNaN(parsed) ? null : parsed;
      }
      
      if (fields.course_completed === '' || fields.course_completed === undefined) {
        fields.course_completed = null;
      } else if (fields.course_completed !== null && typeof fields.course_completed === 'string') {
        const parsed = parseInt(fields.course_completed, 10);
        fields.course_completed = isNaN(parsed) ? null : parsed;
      }
      
      const data = await newMuslimBonusModel.create(fields);
      
      // Automatically trigger email based on template configuration
      afterCreate('New_Muslim_Bonus', data);
      
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
      
      // Convert empty strings to null for nullable bigint fields
      if (fields.revert_gender === '' || fields.revert_gender === undefined) {
        fields.revert_gender = null;
      } else if (fields.revert_gender !== null && typeof fields.revert_gender === 'string') {
        const parsed = parseInt(fields.revert_gender, 10);
        fields.revert_gender = isNaN(parsed) ? null : parsed;
      }
      
      if (fields.revert_pack_requested === '' || fields.revert_pack_requested === undefined) {
        fields.revert_pack_requested = null;
      } else if (fields.revert_pack_requested !== null && typeof fields.revert_pack_requested === 'string') {
        const parsed = parseInt(fields.revert_pack_requested, 10);
        fields.revert_pack_requested = isNaN(parsed) ? null : parsed;
      }
      
      if (fields.course_completed === '' || fields.course_completed === undefined) {
        fields.course_completed = null;
      } else if (fields.course_completed !== null && typeof fields.course_completed === 'string') {
        const parsed = parseInt(fields.course_completed, 10);
        fields.course_completed = isNaN(parsed) ? null : parsed;
      }
      
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

