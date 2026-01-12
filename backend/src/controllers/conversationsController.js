const conversationsModel = require('../models/conversationsModel');
const conversationParticipantsModel = require('../models/conversationParticipantsModel');

const conversationsController = {
  getAll: async (req, res) => { 
    try { 
      // ✅ Filter by participant - users only see conversations they're part of
      // IDP doesn't have centers - no center_id filtering
      const userId = req.user?.id || null;
      
      // ✅ Normalize userId: convert to integer or null
      let normalizedUserId = null;
      if (userId !== null && userId !== undefined) {
        normalizedUserId = parseInt(userId);
        if (isNaN(normalizedUserId)) {
          normalizedUserId = null;
        }
      }
      
      const data = await conversationsModel.getAll(normalizedUserId); 
      res.json(data); 
    } catch(err){ 
      console.error(`[ERROR] Conversations.getAll - ${err.message}`, err);
      res.status(500).json({error: err.message}); 
    } 
  },
  
  getById: async (req, res) => { 
    try { 
      // ✅ Filter by participant - users can only view conversations they're part of
      // IDP doesn't have centers - no center_id filtering
      const userId = req.user?.id || null;
      
      // Normalize userId
      let normalizedUserId = null;
      if (userId !== null && userId !== undefined) {
        normalizedUserId = parseInt(userId);
        if (isNaN(normalizedUserId)) {
          normalizedUserId = null;
        }
      }
      
      const data = await conversationsModel.getById(req.params.id, normalizedUserId); 
      if(!data) return res.status(404).json({error: 'Not found'}); 
      res.json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  create: async (req, res) => { 
    try { 
      // ✅ Prevent Imam Users (role 6) from creating conversations
      const userType = req.user?.user_type || req.user?.User_Type || req.user?.userType;
      if (userType == 6 || userType === "6") {
        return res.status(403).json({ 
          error: "Imam Users cannot create conversations. Please contact an Admin to start a conversation." 
        });
      }

      // ✅ Enforce audit fields
      const fields = { ...req.body };
      const username = req.user?.username || 'system';
      fields.created_by = fields.created_by || username;
      fields.updated_by = fields.updated_by || username;
      // IDP doesn't have centers - no center_id
      
      const data = await conversationsModel.create(fields); 
      res.status(201).json(data); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
  
  update: async (req, res) => { 
    try { 
      const fields = { ...req.body };
      // ✅ Enforce audit fields and prevent created_by override
      delete fields.created_by;
      fields.updated_by = req.user?.username || 'system';
      // IDP doesn't have centers - no center_id
      
      // ✅ Filter by participant - users can only update conversations they're part of
      const userId = req.user?.id || null;
      let normalizedUserId = null;
      if (userId !== null && userId !== undefined) {
        normalizedUserId = parseInt(userId);
        if (isNaN(normalizedUserId)) {
          normalizedUserId = null;
        }
      }
      
      // Verify user is a participant before updating
      const existing = await conversationsModel.getById(req.params.id, normalizedUserId);
      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }
      
      const data = await conversationsModel.update(req.params.id, fields); 
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
      // ✅ Soft delete: Mark conversation as deleted for the current user only
      // This is WhatsApp-like behavior - deleting a conversation only hides it for that user
      // Other participants can still see it
      const conversationId = req.params.id;
      const userId = req.user?.id || null;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Normalize userId
      let normalizedUserId = parseInt(userId);
      if (isNaN(normalizedUserId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Normalize conversationId
      let normalizedConversationId = parseInt(conversationId);
      if (isNaN(normalizedConversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      // Verify user is a participant
      const existing = await conversationsModel.getById(normalizedConversationId, normalizedUserId);
      if (!existing) {
        return res.status(404).json({ error: "Conversation not found or you are not a participant" });
      }
      
      // Soft delete: Mark conversation as deleted for this user only
      const deleted = await conversationParticipantsModel.markConversationDeletedForUser(
        normalizedConversationId,
        normalizedUserId
      );
      
      if (!deleted) {
        return res.status(404).json({ error: "Failed to delete conversation" });
      }
      
      res.json({message: 'Conversation deleted successfully'}); 
    } catch(err){ 
      res.status(500).json({error: err.message}); 
    } 
  },
};

module.exports = conversationsController;
