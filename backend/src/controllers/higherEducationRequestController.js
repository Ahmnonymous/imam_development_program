const higherEducationRequestModel = require('../models/higherEducationRequestModel');
const fs = require('fs').promises;

const higherEducationRequestController = {
  getAll: async (req, res) => { 
    try {
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await higherEducationRequestModel.getAll(imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const data = await higherEducationRequestModel.getById(req.params.id); 
      if(!data) return res.status(404).json({error: 'Not found'}); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  create: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      // Handle integer fields - convert empty strings to null
      if (fields.course_type !== undefined && fields.course_type !== null && fields.course_type !== '') {
        fields.course_type = parseInt(fields.course_type);
      } else {
        fields.course_type = null;
      }
      
      if (fields.duration !== undefined && fields.duration !== null && fields.duration !== '') {
        fields.duration = parseInt(fields.duration);
      } else {
        fields.duration = null;
      }
      
      if (fields.study_method !== undefined && fields.study_method !== null && fields.study_method !== '') {
        fields.study_method = parseInt(fields.study_method);
      } else {
        fields.study_method = null;
      }
      
      if (fields.times_per_month !== undefined && fields.times_per_month !== null && fields.times_per_month !== '') {
        fields.times_per_month = parseInt(fields.times_per_month);
      } else {
        fields.times_per_month = null;
      }
      
      if (fields.semesters_per_year !== undefined && fields.semesters_per_year !== null && fields.semesters_per_year !== '') {
        fields.semesters_per_year = parseInt(fields.semesters_per_year);
      } else {
        fields.semesters_per_year = null;
      }
      
      if (fields.will_stop_imam_duties !== undefined && fields.will_stop_imam_duties !== null && fields.will_stop_imam_duties !== '') {
        fields.will_stop_imam_duties = parseInt(fields.will_stop_imam_duties);
      } else {
        fields.will_stop_imam_duties = null;
      }
      
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id) || 1;
      } else {
        fields.status_id = 1; // Default to Pending
      }
      
      // Handle decimal fields - convert empty strings to null
      if (fields.cost_local_currency !== undefined && fields.cost_local_currency !== null && fields.cost_local_currency !== '') {
        fields.cost_local_currency = parseFloat(fields.cost_local_currency);
      } else {
        fields.cost_local_currency = null;
      }
      
      if (fields.cost_south_african_rand !== undefined && fields.cost_south_african_rand !== null && fields.cost_south_african_rand !== '') {
        fields.cost_south_african_rand = parseFloat(fields.cost_south_african_rand);
      } else {
        fields.cost_south_african_rand = null;
      }
      
      const username = req.user?.username || 'system';
      fields.created_by = username;
      fields.updated_by = username;
      
      if (req.files && req.files.Course_Brochure && req.files.Course_Brochure.length > 0) {
        const file = req.files.Course_Brochure[0];
        const buffer = await fs.readFile(file.path);
        fields.course_brochure = buffer;
        fields.course_brochure_filename = file.originalname;
        fields.course_brochure_mime = file.mimetype;
        fields.course_brochure_size = file.size;
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Quotation && req.files.Quotation.length > 0) {
        const file = req.files.Quotation[0];
        const buffer = await fs.readFile(file.path);
        fields.quotation = buffer;
        fields.quotation_filename = file.originalname;
        fields.quotation_mime = file.mimetype;
        fields.quotation_size = file.size;
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Motivation_Letter && req.files.Motivation_Letter.length > 0) {
        const file = req.files.Motivation_Letter[0];
        const buffer = await fs.readFile(file.path);
        fields.motivation_letter = buffer;
        fields.motivation_letter_filename = file.originalname;
        fields.motivation_letter_mime = file.mimetype;
        fields.motivation_letter_size = file.size;
        await fs.unlink(file.path);
      }
      
      const data = await higherEducationRequestModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Higher_Education_Request: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      // Handle integer fields - convert empty strings to null
      if (fields.course_type !== undefined && fields.course_type !== null && fields.course_type !== '') {
        fields.course_type = parseInt(fields.course_type);
      } else {
        fields.course_type = null;
      }
      
      if (fields.duration !== undefined && fields.duration !== null && fields.duration !== '') {
        fields.duration = parseInt(fields.duration);
      } else {
        fields.duration = null;
      }
      
      if (fields.study_method !== undefined && fields.study_method !== null && fields.study_method !== '') {
        fields.study_method = parseInt(fields.study_method);
      } else {
        fields.study_method = null;
      }
      
      if (fields.times_per_month !== undefined && fields.times_per_month !== null && fields.times_per_month !== '') {
        fields.times_per_month = parseInt(fields.times_per_month);
      } else {
        fields.times_per_month = null;
      }
      
      if (fields.semesters_per_year !== undefined && fields.semesters_per_year !== null && fields.semesters_per_year !== '') {
        fields.semesters_per_year = parseInt(fields.semesters_per_year);
      } else {
        fields.semesters_per_year = null;
      }
      
      if (fields.will_stop_imam_duties !== undefined && fields.will_stop_imam_duties !== null && fields.will_stop_imam_duties !== '') {
        fields.will_stop_imam_duties = parseInt(fields.will_stop_imam_duties);
      } else {
        fields.will_stop_imam_duties = null;
      }
      
      if (fields.status_id !== undefined && fields.status_id !== null && fields.status_id !== '') {
        fields.status_id = parseInt(fields.status_id) || 1;
      }
      
      // Handle decimal fields - convert empty strings to null
      if (fields.cost_local_currency !== undefined && fields.cost_local_currency !== null && fields.cost_local_currency !== '') {
        fields.cost_local_currency = parseFloat(fields.cost_local_currency);
      } else {
        fields.cost_local_currency = null;
      }
      
      if (fields.cost_south_african_rand !== undefined && fields.cost_south_african_rand !== null && fields.cost_south_african_rand !== '') {
        fields.cost_south_african_rand = parseFloat(fields.cost_south_african_rand);
      } else {
        fields.cost_south_african_rand = null;
      }
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Course_Brochure && req.files.Course_Brochure.length > 0) {
        const file = req.files.Course_Brochure[0];
        const buffer = await fs.readFile(file.path);
        fields.course_brochure = buffer;
        fields.course_brochure_filename = file.originalname;
        fields.course_brochure_mime = file.mimetype;
        fields.course_brochure_size = file.size;
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Quotation && req.files.Quotation.length > 0) {
        const file = req.files.Quotation[0];
        const buffer = await fs.readFile(file.path);
        fields.quotation = buffer;
        fields.quotation_filename = file.originalname;
        fields.quotation_mime = file.mimetype;
        fields.quotation_size = file.size;
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Motivation_Letter && req.files.Motivation_Letter.length > 0) {
        const file = req.files.Motivation_Letter[0];
        const buffer = await fs.readFile(file.path);
        fields.motivation_letter = buffer;
        fields.motivation_letter_filename = file.originalname;
        fields.motivation_letter_mime = file.mimetype;
        fields.motivation_letter_size = file.size;
        await fs.unlink(file.path);
      }
      
      const data = await higherEducationRequestModel.update(req.params.id, fields); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Higher_Education_Request: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const deleted = await higherEducationRequestModel.delete(req.params.id); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = higherEducationRequestController;

