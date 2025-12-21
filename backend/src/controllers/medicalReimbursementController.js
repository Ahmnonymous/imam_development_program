const medicalReimbursementModel = require('../models/medicalReimbursementModel');
const fs = require('fs').promises;

const medicalReimbursementController = {
  getAll: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const imamProfileId = req.query.imam_profile_id || null;
      const data = await medicalReimbursementModel.getAll(centerId, isSuperAdmin, imamProfileId); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await medicalReimbursementModel.getById(req.params.id, centerId, isSuperAdmin); 
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
      
      if (req.files && req.files.Receipt && req.files.Receipt.length > 0) {
        const file = req.files.Receipt[0];
        const buffer = await fs.readFile(file.path);
        fields.Receipt = buffer;
        fields.Receipt_Filename = file.originalname;
        fields.Receipt_Mime = file.mimetype;
        fields.Receipt_Size = file.size;
        fields.Receipt_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Supporting_Docs && req.files.Supporting_Docs.length > 0) {
        const file = req.files.Supporting_Docs[0];
        const buffer = await fs.readFile(file.path);
        fields.Supporting_Docs = buffer;
        fields.Supporting_Docs_Filename = file.originalname;
        fields.Supporting_Docs_Mime = file.mimetype;
        fields.Supporting_Docs_Size = file.size;
        fields.Supporting_Docs_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const data = await medicalReimbursementModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error creating record in Medical_Reimbursement: " + err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      
      const username = req.user?.username || 'system';
      fields.updated_by = username;
      delete fields.created_by;
      
      if (req.files && req.files.Receipt && req.files.Receipt.length > 0) {
        const file = req.files.Receipt[0];
        const buffer = await fs.readFile(file.path);
        fields.Receipt = buffer;
        fields.Receipt_Filename = file.originalname;
        fields.Receipt_Mime = file.mimetype;
        fields.Receipt_Size = file.size;
        fields.Receipt_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      if (req.files && req.files.Supporting_Docs && req.files.Supporting_Docs.length > 0) {
        const file = req.files.Supporting_Docs[0];
        const buffer = await fs.readFile(file.path);
        fields.Supporting_Docs = buffer;
        fields.Supporting_Docs_Filename = file.originalname;
        fields.Supporting_Docs_Mime = file.mimetype;
        fields.Supporting_Docs_Size = file.size;
        fields.Supporting_Docs_Updated_At = new Date().toISOString();
        await fs.unlink(file.path);
      }
      
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const data = await medicalReimbursementModel.update(req.params.id, fields, centerId, isSuperAdmin); 
      if (!data) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: "Error updating record in Medical_Reimbursement: " + err.message}); 
    } 
  },
  
  delete: async (req, res) => { 
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const deleted = await medicalReimbursementModel.delete(req.params.id, centerId, isSuperAdmin); 
      if (!deleted) {
        return res.status(404).json({error: 'Not found'}); 
      }
      res.json({message: 'Deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },

  downloadReceipt: async (req, res) => {
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const record = await medicalReimbursementModel.getById(req.params.id, centerId, isSuperAdmin);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Receipt) return res.status(404).send("No receipt found");
  
      const mimeType = record.Receipt_Mime || "application/pdf";
      const filename = record.Receipt_Filename || "receipt";
  
      let buffer = record.Receipt;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown receipt encoding");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading receipt: " + err.message });
    }
  },

  downloadSupportingDocs: async (req, res) => {
    try {
      const centerId = req.center_id || req.user?.center_id;
      const isSuperAdmin = req.isAppAdmin || false;
      const record = await medicalReimbursementModel.getById(req.params.id, centerId, isSuperAdmin);
      if (!record) return res.status(404).send("Record not found");
      if (!record.Supporting_Docs) return res.status(404).send("No supporting documents found");
  
      const mimeType = record.Supporting_Docs_Mime || "application/pdf";
      const filename = record.Supporting_Docs_Filename || "supporting_docs";
  
      let buffer = record.Supporting_Docs;
      if (typeof buffer === "string") {
        if (buffer.startsWith("\\x")) {
          buffer = Buffer.from(buffer.slice(2), "hex");
        } else if (/^[A-Za-z0-9+/=]+$/.test(buffer)) {
          buffer = Buffer.from(buffer, "base64");
        } else {
          throw new Error("Unknown supporting docs encoding");
        }
      }
  
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: "Error downloading supporting docs: " + err.message });
    }
  },
};

module.exports = medicalReimbursementController;

