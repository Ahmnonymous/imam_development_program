const imamProfilesModel = require('../models/imamProfilesModel');
const { afterCreate, afterUpdate } = require('../utils/modelHelpers');
const pool = require('../config/db');
const fs = require('fs').promises;

// Helper function to sanitize fields (convert empty strings to null for bigint, date, and decimal fields)
const sanitizeFields = (fields) => {
  const bigintFields = [
    'title', 'madhab', 'race', 'gender', 'marital_status', 'nationality_id',
    'province_id', 'suburb_id', 'employment_type', 'lead_salah_in_masjid',
    'teach_maktab_madrassah', 'do_street_dawah', 'teaching_frequency',
    'teach_adults_community_classes', 'average_students_taught_daily',
    'prayers_lead_daily', 'jumuah_prayers_lead', 'average_fajr_attendees',
    'average_dhuhr_attendees', 'average_asr_attendees', 'average_maghrib_attendees',
    'average_esha_attendees', 'english_proficiency', 'arabic_proficiency',
    'quran_reading_ability', 'public_speaking_khutbah_skills'
  ];
  
  const dateFields = ['dob'];
  const decimalFields = ['longitude', 'latitude'];
  
  const sanitized = { ...fields };
  
  // Sanitize bigint fields
  bigintFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === 'null') {
      sanitized[field] = null;
    } else if (sanitized[field] !== null && sanitized[field] !== undefined && typeof sanitized[field] === 'string') {
      const parsed = parseInt(sanitized[field], 10);
      if (!isNaN(parsed)) {
        sanitized[field] = parsed;
      } else {
        sanitized[field] = null;
      }
    }
  });
  
  // Sanitize date fields
  dateFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === 'null') {
      sanitized[field] = null;
    }
  });
  
  // Sanitize decimal fields
  decimalFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === 'null') {
      sanitized[field] = null;
    } else if (sanitized[field] !== null && sanitized[field] !== undefined && typeof sanitized[field] === 'string') {
      const parsed = parseFloat(sanitized[field]);
      if (!isNaN(parsed)) {
        sanitized[field] = parsed;
      } else {
        sanitized[field] = null;
      }
    }
  });
  
  // Handle status_id specially (must not be null, default to 1)
  if (sanitized.status_id === '' || sanitized.status_id === 'null') {
    sanitized.status_id = 1;
  } else if (sanitized.status_id !== null && sanitized.status_id !== undefined && typeof sanitized.status_id === 'string') {
    const parsed = parseInt(sanitized.status_id, 10);
    sanitized.status_id = !isNaN(parsed) ? parsed : 1;
  }
  
  return sanitized;
};

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
      let fields = { ...req.body };
      
      // Sanitize fields (convert empty strings to null for bigint, date, and decimal fields)
      fields = sanitizeFields(fields);
      
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
      
      // Automatically trigger email based on template configuration
      afterCreate('Imam_Profiles', data);
      
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Imam_Profiles: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      let fields = { ...req.body };
      
      // Sanitize fields (convert empty strings to null for bigint, date, and decimal fields)
      fields = sanitizeFields(fields);
      
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
      
      // Get old profile to check if status changed (needed for email hook)
      const oldProfile = await imamProfilesModel.getById(req.params.id);
      
      const data = await imamProfilesModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      
      // Automatically trigger email based on template configuration
      // The hook will detect status_id changes and use the appropriate template
      afterUpdate('Imam_Profiles', data, oldProfile);
      
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

