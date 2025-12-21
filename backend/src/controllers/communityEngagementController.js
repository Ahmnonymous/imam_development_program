const communityEngagementModel = require('../models/communityEngagementModel');
const fs = require('fs').promises;

const communityEngagementController = {
  getAll: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await communityEngagementModel.getAll(centerId, isSuperAdmin, imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await communityEngagementModel.getById(req.params.id, centerId, isSuperAdmin); 
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
      
      fields.center_id = req.center_id || req.user?.center_id;
      
      if (req.files && req.files.Engagement_Image && req.files.Engagement_Image.length > 0) {
        const file = req.files.Engagement_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.Engagement_Image = buffer;
        fields.Engagement_Image_Filename = file.originalname;
        fields.Engagement_Image_Mime = file.mimetype;
        fields.Engagement_Image_Size = file.size;
        fields.Engagement_Image_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await communityEngagementModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Community_Engagement: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Engagement_Image && req.files.Engagement_Image.length > 0) {
        const file = req.files.Engagement_Image[0];
        const buffer = await fs.readFile(file.path);
        fields.Engagement_Image = buffer;
        fields.Engagement_Image_Filename = file.originalname;
        fields.Engagement_Image_Mime = file.mimetype;
        fields.Engagement_Image_Size = file.size;
        fields.Engagement_Image_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await communityEngagementModel.update(req.params.id, fields, centerId, isSuperAdmin); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Community_Engagement: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const deleted = await communityEngagementModel.delete(req.params.id, centerId, isSuperAdmin); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  downloadImage: async (req, res) => {
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const record = await communityEngagementModel.getById(req.params.id, centerId, isSuperAdmin);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Engagement_Image) return res.status(404).send("No image found");
  
      const mimeType = record.Engagement_Image_Mime || "image/jpeg";
      const filename = record.Engagement_Image_Filename || "engagement_image";
  
      let buffer = record.Engagement_Image;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown image encoding");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading image: " + err.message });
    }
  },
};

module.exports = communityEngagementController;

