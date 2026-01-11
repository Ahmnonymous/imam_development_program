const imamProfilesModel = require('../models/imamProfilesModel');
const fs = require('fs').promises;

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

  getByUsername: async (req, res) => {
    try {
      const employeeId = req.user?.id;
      if (!employeeId) {
        return res.status(401).json({error: 'Unauthorized'});
      }
      const data = await imamProfilesModel.getByEmployeeId(employeeId);
      if (!data) return res.status(404).json({error: 'Not found'});
      res.json(data);
    } catch(err) {
      res.status(500).json({error: err.message});
    }
  },
  
  create: async (req, res) => {
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      const employeeId = req.user?.id;
      
      if (!employeeId) {
        return res.status(400).json({error: "Employee ID is required"});
      }
      
      // Check if employee already has an imam profile
      const existingProfile = await imamProfilesModel.getByEmployeeId(employeeId);
      if (existingProfile) {
        return res.status(400).json({error: "Employee already has an imam profile"});
      }
      
      fields.created_by = username;
      fields.updated_by = username;
      fields.employee_id = employeeId;
      
      // Set default status_id to 1 (Pending) if not provided
      if (!fields.status_id) {
        fields.status_id = 1;
      }
      
      // Handle Masjid_Image file upload
      if (req.files && req.files.Masjid_Image && req.files.Masjid_Image.length > 0) {
        const file = req.files.Masjid_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.masjid_image = buffer;
        fields.masjid_image_filename = file.originalname;
        fields.masjid_image_mime = file.mimetype;
        fields.masjid_image_size = file.size;
        await fs.unlink(file.path);
      }
      
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
      
      // Remove file-related fields if no file is provided
      if (!req.files || !req.files.Masjid_Image || req.files.Masjid_Image.length === 0) {
        delete fields.masjid_image;
        delete fields.masjid_image_filename;
        delete fields.masjid_image_mime;
        delete fields.masjid_image_size;
      } else {
        const file = req.files.Masjid_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.masjid_image = buffer;
        fields.masjid_image_filename = file.originalname;
        fields.masjid_image_mime = file.mimetype;
        fields.masjid_image_size = file.size;
        await fs.unlink(file.path);
      }
      
      // Clean up undefined values
      Object.keys(fields).forEach(key => {
        if (fields[key] === undefined) {
          delete fields[key];
        }
      });
      
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

