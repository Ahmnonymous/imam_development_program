const emailService = require('../services/emailService');
const imamProfilesModel = require('../models/imamProfilesModel');
const pool = require('../config/db');

/**
 * Automatically extract email variables from record data
 * This function intelligently extracts variables based on table structure
 */
async function extractEmailVariables(tableName, record, oldRecord = null) {
  const variables = {};
  
  // Common variables - always try to get imam info if imam_profile_id exists
  if (record.imam_profile_id) {
    try {
      const imam = await imamProfilesModel.getById(record.imam_profile_id);
      if (imam) {
        variables.imam_name = `${imam.name || ''} ${imam.surname || ''}`.trim();
        variables.imam_surname = imam.surname || '';
        variables.imam_email = imam.email || '';
        variables.file_number = imam.file_number || '';
      }
    } catch (err) {
      console.warn(`⚠️ Could not fetch imam profile ${record.imam_profile_id}:`, err.message);
    }
  }
  
  // Date formatting - use updated_at for updates, created_at for creates
  if (record.created_at || record.updated_at) {
    const date = new Date(record.updated_at || record.created_at);
    variables.submission_date = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Table-specific variable extraction mappings
  const fieldMappings = {
    'Jumuah_Khutbah_Topic': { 
      topic: 'topic', 
      masjid_name: 'masjid_name' 
    },
    'Jumuah_Audio_Khutbah': { 
      topic: 'topic', 
      masjid_name: 'masjid_name' 
    },
    'Pearls_Of_Wisdom': { 
      topic: 'title' 
    },
    'Medical_Reimbursement': { 
      topic: 'illness_description' 
    },
    'Community_Engagement': { 
      topic: 'description', 
      masjid_name: 'location' 
    },
    'Nikah_Bonus': { 
      topic: 'description' 
    },
    'New_Muslim_Bonus': { 
      topic: 'revert_name' 
    },
    'New_Baby_Bonus': { 
      topic: 'baby_name' 
    },
    'imam_financial_assistance': { 
      topic: 'description' 
    },
    'Imam_Profiles': { 
      imam_name: () => `${record.name || ''} ${record.surname || ''}`.trim(),
      imam_surname: 'surname',
      imam_email: 'email',
      file_number: 'file_number'
    },
    'Messages': {
      message_preview: () => record.message_text ? 
        (record.message_text.length > 100 ? record.message_text.substring(0, 100) + '...' : record.message_text) 
        : 'No message text',
      message_text: 'message_text'
    }
  };
  
  const mapping = fieldMappings[tableName] || {};
  for (const [varName, fieldName] of Object.entries(mapping)) {
    if (typeof fieldName === 'function') {
      variables[varName] = fieldName(record);
    } else if (record[fieldName] !== undefined) {
      variables[varName] = record[fieldName] || '';
    }
  }
  
  return variables;
}

/**
 * Get recipient email for Messages table
 */
async function getRecipientEmailForMessage(record) {
  try {
    if (!record.conversation_id || !record.sender_id) {
      return null;
    }
    
    // Get all participants
    const participantsRes = await pool.query(
      'SELECT employee_id FROM Conversation_Participants WHERE conversation_id = $1',
      [record.conversation_id]
    );
    
    // Find recipient (not sender)
    for (const participant of participantsRes.rows) {
      const participantId = parseInt(participant.employee_id);
      if (participantId === parseInt(record.sender_id)) {
        continue; // Skip sender
      }
      
      // Try Imam_Profiles first
      const imamProfileRes = await pool.query(
        'SELECT email FROM Imam_Profiles WHERE employee_id = $1 LIMIT 1',
        [participantId]
      );
      if (imamProfileRes.rows[0] && imamProfileRes.rows[0].email) {
        return imamProfileRes.rows[0].email;
      }
      
      // Try Employee table
      try {
        const employeeEmailRes = await pool.query(
          'SELECT email FROM Employee WHERE id = $1 AND email IS NOT NULL AND email != \'\' LIMIT 1',
          [participantId]
        );
        if (employeeEmailRes.rows[0] && employeeEmailRes.rows[0].email) {
          return employeeEmailRes.rows[0].email;
        }
      } catch (e) {
        // Employee table might not have email column
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error getting recipient email for message:', err);
    return null;
  }
}

/**
 * Get additional variables for Messages (sender name, conversation title)
 */
async function getMessageVariables(record) {
  const variables = {};
  
  try {
    // Get sender info
    const senderRes = await pool.query(
      'SELECT id, name, surname FROM Employee WHERE id = $1',
      [record.sender_id]
    );
    if (senderRes.rows[0]) {
      const sender = senderRes.rows[0];
      variables.sender_name = `${sender.name || ''} ${sender.surname || ''}`.trim();
    }
    
    // Get conversation info
    if (record.conversation_id) {
      const conversationRes = await pool.query(
        'SELECT title FROM Conversations WHERE id = $1',
        [record.conversation_id]
      );
      if (conversationRes.rows[0]) {
        variables.conversation_title = conversationRes.rows[0].title || 'Conversation';
      }
    }
    
    // Get recipient name
    const recipientEmail = await getRecipientEmailForMessage(record);
    if (recipientEmail) {
      // Try to get recipient name from Employee
      const participantsRes = await pool.query(
        'SELECT employee_id FROM Conversation_Participants WHERE conversation_id = $1 AND employee_id != $2',
        [record.conversation_id, record.sender_id]
      );
      if (participantsRes.rows[0]) {
        const recipientId = participantsRes.rows[0].employee_id;
        const recipientRes = await pool.query(
          'SELECT name, surname FROM Employee WHERE id = $1',
          [recipientId]
        );
        if (recipientRes.rows[0]) {
          variables.recipient_name = `${recipientRes.rows[0].name || ''} ${recipientRes.rows[0].surname || ''}`.trim();
        }
      }
    }
  } catch (err) {
    console.error('Error getting message variables:', err);
  }
  
  return variables;
}

/**
 * Automatically trigger email after model operation
 * This is the main hook function that should be called after create/update
 */
async function triggerEmailHook(tableName, action, record, oldRecord = null, options = {}) {
  // Don't block the main request - run in background
  setImmediate(async () => {
    try {
      console.log(`📧 Auto-email hook triggered for ${tableName} ${action} (ID: ${record.id})`);
      
      // Determine status_id if this is an UPDATE with status change
      let statusId = null;
      if (action === 'UPDATE' && oldRecord && record.status_id && oldRecord.status_id !== record.status_id) {
        statusId = record.status_id;
        console.log(`📧 Status change detected: ${oldRecord.status_id} -> ${record.status_id}`);
      }
      
      // Extract variables automatically
      let emailVariables = await extractEmailVariables(tableName, record, oldRecord);
      
      // Special handling for Messages table
      if (tableName === 'Messages') {
        const messageVars = await getMessageVariables(record);
        emailVariables = { ...emailVariables, ...messageVars };
      }
      
      // Determine imamProfileId
      let imamProfileId = record.imam_profile_id || null;
      if (tableName === 'Imam_Profiles' && record.id) {
        imamProfileId = record.id;
      }
      
      // Special handling for Messages - send to all participants
      if (tableName === 'Messages') {
        try {
          if (!record.conversation_id || !record.sender_id) {
            console.warn(`⚠️ Missing conversation_id or sender_id for message ${record.id} - skipping email`);
            return;
          }
          
          // Get all participants
          const participantsRes = await pool.query(
            'SELECT employee_id FROM Conversation_Participants WHERE conversation_id = $1',
            [record.conversation_id]
          );
          
          // Send email to each participant (except sender)
          for (const participant of participantsRes.rows) {
            const participantId = parseInt(participant.employee_id);
            
            // Skip sender
            if (participantId === parseInt(record.sender_id)) {
              continue;
            }
            
            // Get recipient email
            let recipientEmail = null;
            
            // Try Imam_Profiles first
            const imamProfileRes = await pool.query(
              'SELECT email FROM Imam_Profiles WHERE employee_id = $1 LIMIT 1',
              [participantId]
            );
            if (imamProfileRes.rows[0] && imamProfileRes.rows[0].email) {
              recipientEmail = imamProfileRes.rows[0].email;
            }
            
            // Try Employee table
            if (!recipientEmail) {
              try {
                const employeeEmailRes = await pool.query(
                  'SELECT email FROM Employee WHERE id = $1 AND email IS NOT NULL AND email != \'\' LIMIT 1',
                  [participantId]
                );
                if (employeeEmailRes.rows[0] && employeeEmailRes.rows[0].email) {
                  recipientEmail = employeeEmailRes.rows[0].email;
                }
              } catch (e) {
                // Employee table might not have email column
              }
            }
            
            if (!recipientEmail) {
              console.warn(`⚠️ No email found for participant ${participantId} - skipping`);
              continue;
            }
            
            // Send email to this specific recipient
            const emailResult = await emailService.sendEmail(
              tableName,
              action,
              emailVariables,
              null,
              recipientEmail,
              statusId
            );
            
            if (emailResult.success) {
              console.log(`✅ Auto-email sent to ${recipientEmail} for ${tableName} ${action}`);
            } else {
              console.warn(`⚠️ Auto-email failed for ${recipientEmail}:`, emailResult.error);
            }
          }
        } catch (err) {
          console.error(`❌ Error sending Messages emails:`, err.message);
        }
        return; // Messages handled separately, exit early
      }
      
      // For all other tables, send email normally
      const emailResult = await emailService.sendEmail(
        tableName,
        action,
        emailVariables,
        imamProfileId,
        null,
        statusId
      );
      
      if (emailResult.success) {
        console.log(`✅ Auto-email sent for ${tableName} ${action}:`, emailResult.message);
      } else {
        console.warn(`⚠️ Auto-email failed for ${tableName} ${action}:`, emailResult.error);
      }
    } catch (error) {
      // Don't fail the request if email fails
      console.error(`❌ Error in email hook for ${tableName} ${action}:`, {
        error: error.message,
        stack: error.stack
      });
    }
  });
}

module.exports = { 
  triggerEmailHook, 
  extractEmailVariables,
  getRecipientEmailForMessage,
  getMessageVariables
};

