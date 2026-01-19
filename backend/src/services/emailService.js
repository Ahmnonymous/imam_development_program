const postmark = require('postmark');
const emailTemplateModel = require('../models/emailTemplateModel');
const imamProfilesModel = require('../models/imamProfilesModel');
const pool = require('../config/db');

// Mapping from table names to animated email image filenames (using PNG for better email client support)
const ANIMATED_EMAIL_IMAGE_MAPPING = {
  "Jumuah_Khutbah_Topic": "Jumuah Khutbah Topic Submissionder/creative-idea-lightbulb-cartoon-illustration-2025-10-20-02-21-50-utc.png",
  "Jumuah_Audio_Khutbah": "Jumuah Khutbah Audio Submission/corporate-business-speaker-illustration-2025-10-20-04-28-31-utc.png",
  "Pearls_Of_Wisdom": "Pearls of Wisdom/ai-brainstorming-duotone-illustration-2025-10-20-04-33-45-utc.png",
  "Medical_Reimbursement": "Medical Assistance/medical-examination-tools-cartoon-illustration-2025-10-20-04-32-48-utc.png",
  "Community_Engagement": "Community Engagement/diverse-people-in-community-disability-2025-10-20-04-28-17-utc.png",
  "Nikah_Bonus": "Nikah Bonus/illustration-of-a-muslim-couple-in-love-2025-10-20-06-25-40-utc.png",
  "New_Muslim_Bonus": "New Muslim Bonus/flat-illustration-of-arab-man-in-traditional-dress-2025-10-20-02-32-55-utc.png",
  "New_Baby_Bonus": "New Baby Bonus/woman-cradling-a-baby-2025-11-05-06-06-57-utc.png",
  "imam_financial_assistance": "Financial Assistance/writing-a-check-illustration-2025-10-20-04-33-44-utc.png",
};

class EmailService {
  constructor() {
    this.client = process.env.POSTMARK_SERVER_TOKEN
      ? new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN)
      : null;
  }

  /**
   * Replace variables in template string
   * Supports both {{variable}} and ((variable)) formats
   */
  replaceVariables(template, variables) {
    let result = template;
    
    // Replace {{variable}} format
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });

    // Replace ((variable)) format
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\(\\(${key}\\)\\)`, 'g');
      result = result.replace(regex, variables[key] || '');
    });

    return result;
  }

  /**
   * Get admin email addresses (User_Type = 1)
   * Also checks for EMAIL_TO environment variable as fallback
   */
  async getAdminEmails() {
    try {
      // First check environment variable
      if (process.env.EMAIL_TO) {
        const envEmails = process.env.EMAIL_TO.split(',').map(e => e.trim()).filter(e => e);
        if (envEmails.length > 0) {
          return envEmails;
        }
      }

      // Then check database
      const query = `
        SELECT e.email 
        FROM Employee e
        WHERE e.user_type = 1 AND e.email IS NOT NULL AND e.email != ''
      `;
      const res = await pool.query(query);
      const dbEmails = res.rows.map(row => row.email).filter(email => email);
      
      // If no emails in DB, check EMAIL_CC as fallback
      if (dbEmails.length === 0 && process.env.EMAIL_CC) {
        return process.env.EMAIL_CC.split(',').map(e => e.trim()).filter(e => e);
      }
      
      return dbEmails;
    } catch (err) {
      console.error('Error fetching admin emails:', err);
      // Fallback to environment variable
      if (process.env.EMAIL_TO) {
        return process.env.EMAIL_TO.split(',').map(e => e.trim()).filter(e => e);
      }
      return [];
    }
  }

  /**
   * Get imam email address by imam_profile_id
   */
  async getImamEmail(imamProfileId) {
    try {
      const imam = await imamProfilesModel.getById(imamProfileId);
      return imam?.email || null;
    } catch (err) {
      console.error('Error fetching imam email:', err);
      return null;
    }
  }

  /**
   * Send email using template
   * @param {string} tableName - Database table name that triggered the email (e.g., 'Jumuah_Khutbah_Topic')
   * @param {string} action - Action that triggered the email (e.g., 'CREATE', 'UPDATE', 'DELETE')
   * @param {object} variables - Variables to replace in template
   * @param {number} imamProfileId - Imam profile ID (if sending to imam)
   * @param {string|array} specificRecipientEmail - Optional: specific email address(es) to send to (overrides recipient_type logic)
   * @param {number} statusId - Optional: status ID for status-specific triggers (e.g., for approval/rejection)
   */
  async sendEmail(tableName, action, variables = {}, imamProfileId = null, specificRecipientEmail = null, statusId = null) {
    let recipients = []; // Initialize early for error handling
    try {
      console.log(`📧 Email Service: Looking for template for table: ${tableName}, action: ${action}${statusId ? `, status_id: ${statusId}` : ''}`);
      
      // Find all matching templates (imam, admin, or both)
      // Always find templates regardless of specificRecipientEmail - we still need the template content
      let imamTemplate = null;
      let adminTemplate = null;
      let bothTemplate = null;
      
      // Try to find all possible templates
      imamTemplate = await emailTemplateModel.getByTrigger(tableName, action, statusId, 'imam');
      adminTemplate = await emailTemplateModel.getByTrigger(tableName, action, statusId, 'admin');
      bothTemplate = await emailTemplateModel.getByTrigger(tableName, action, statusId, 'both');
      
      console.log(`📧 Template search results:`, {
        imam: imamTemplate ? imamTemplate.template_name : 'not found',
        admin: adminTemplate ? adminTemplate.template_name : 'not found',
        both: bothTemplate ? bothTemplate.template_name : 'not found'
      });
      
      // Fallback to old method for backward compatibility
      if (!imamTemplate && !adminTemplate && !bothTemplate && typeof tableName === 'string' && !action) {
        console.log(`📧 Fallback: Trying to find template by type: ${tableName}`);
        const fallbackTemplate = await emailTemplateModel.getByType(tableName);
        if (fallbackTemplate) {
          if (fallbackTemplate.recipient_type === 'imam') {
            imamTemplate = fallbackTemplate;
          } else if (fallbackTemplate.recipient_type === 'admin') {
            adminTemplate = fallbackTemplate;
          } else if (fallbackTemplate.recipient_type === 'both') {
            bothTemplate = fallbackTemplate;
          }
        }
      }
      
      // Build list of templates to use
      const templatesToUse = [];
      
      if (bothTemplate) {
        // If 'both' template exists, use it
        if (bothTemplate.is_active) {
          templatesToUse.push({ template: bothTemplate, recipientType: 'both' });
          console.log(`✅ Using 'both' template: ${bothTemplate.template_name} (ID: ${bothTemplate.id})`);
        } else {
          console.warn(`⚠️ 'both' template found but is inactive: ${bothTemplate.template_name}`);
        }
      } else {
        // Use separate imam and admin templates if they exist
        if (imamTemplate && imamTemplate.is_active) {
          templatesToUse.push({ template: imamTemplate, recipientType: 'imam' });
          console.log(`✅ Using imam template: ${imamTemplate.template_name} (ID: ${imamTemplate.id})`);
        } else if (imamTemplate && !imamTemplate.is_active) {
          console.warn(`⚠️ Imam template found but is inactive: ${imamTemplate.template_name}`);
        }
        
        if (adminTemplate && adminTemplate.is_active) {
          templatesToUse.push({ template: adminTemplate, recipientType: 'admin' });
          console.log(`✅ Using admin template: ${adminTemplate.template_name} (ID: ${adminTemplate.id})`);
        } else if (adminTemplate && !adminTemplate.is_active) {
          console.warn(`⚠️ Admin template found but is inactive: ${adminTemplate.template_name}`);
        }
      }
      
      if (templatesToUse.length === 0) {
        console.error(`❌ No active email template found for table: ${tableName}, action: ${action}`);
        return { success: false, error: 'No active template found' };
      }

      // Get table label for variables
      const availableTables = {
        "Jumuah_Khutbah_Topic": "Jumuah Khutbah Topic",
        "Jumuah_Audio_Khutbah": "Jumuah Audio Khutbah",
        "Imam_Profiles": "Imam Profiles",
        "Pearls_Of_Wisdom": "Pearls of Wisdom",
        "Medical_Reimbursement": "Medical Assistance",
        "Community_Engagement": "Community Engagement",
        "Nikah_Bonus": "Nikah Bonus",
        "New_Muslim_Bonus": "New Muslim Bonus",
        "New_Baby_Bonus": "New Baby Bonus",
        "Higher_Education_Request": "Higher Education Request",
        "Waqf_Loan": "Waqf Loan",
        "Tree_Requests": "Tree Requests",
        "imam_financial_assistance": "Financial Assistance",
        "hardship_relief": "Hardship Relief",
        "Conversations": "Conversations",
        "Messages": "Messages",
      };
      
      const tableLabel = availableTables[tableName] || tableName;
      
      // Add table_name, table_label, and topic to variables
      // topic is an alias for table_label to support {{topic}} variable in templates
      const allVariables = {
        ...variables,
        table_name: tableName,
        table_label: tableLabel,
        topic: tableLabel, // {{topic}} will be replaced with the table label (e.g., "Jumuah Khutbah Topic", "Medical Assistance")
      };

      // Send email
      if (!this.client) {
        console.error('❌ Postmark client not initialized. Check POSTMARK_SERVER_TOKEN in environment variables.');
        return { success: false, error: 'Email service not configured' };
      }
      
      console.log(`✅ Postmark client initialized`);
      const emailFrom = process.env.EMAIL_FROM || 'noreply@imamdp.org';
      // Use environment variable or detect production URL dynamically
      // For emails, always prefer production URL to avoid localhost issues
      let API_BASE_URL = process.env.PRODUCTION_API_URL 
        || process.env.API_BASE_URL 
        || (process.env.NODE_ENV === 'production' ? 'https://imamportal.com' : 'http://localhost:5000');
      
      // Force production URL if we're in production mode (override localhost)
      if (process.env.NODE_ENV === 'production' && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
        API_BASE_URL = process.env.PRODUCTION_API_URL || 'https://imamportal.com';
        console.log(`📧 Forced production URL for email: ${API_BASE_URL}`);
      }

      // Process each template and send emails
      const allResults = [];
      for (const { template: currentTemplate, recipientType } of templatesToUse) {
        console.log(`📧 Processing template: ${currentTemplate.template_name} (recipient_type: ${recipientType})`);
        
        // Replace variables in subject and HTML content for this template
        const subject = this.replaceVariables(currentTemplate.subject, allVariables);
        let htmlContent = this.replaceVariables(currentTemplate.html_content, allVariables);

        // For "Default Submission Template" templates, use animated email images based on table name
        const isDefaultSubmissionTemplate = currentTemplate.template_name === 'Default Submission Template - Imam User' || 
                                            currentTemplate.template_name === 'Default Submission Template - App Admin';
        
        let imageUrl = null;
        
        if (isDefaultSubmissionTemplate && ANIMATED_EMAIL_IMAGE_MAPPING[tableName]) {
          // Use the mapped animated email image from backend public directory
          const imagePath = ANIMATED_EMAIL_IMAGE_MAPPING[tableName];
          // URL encode each segment of the path to handle spaces in folder names (spaces become %20)
          const encodedPath = imagePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
          // Always use production URL for email images (never use localhost)
          const productionBaseUrl = process.env.PRODUCTION_API_URL || process.env.API_BASE_URL || 'https://imamportal.com';
          // Force https://imamportal.com if we detect localhost in the URL
          const baseUrl = (productionBaseUrl.includes('localhost') || productionBaseUrl.includes('127.0.0.1')) 
            ? 'https://imamportal.com' 
            : productionBaseUrl;
          imageUrl = `${baseUrl}/public/images/animated_email_images/${encodedPath}`;
          console.log(`📧 Using animated email image for table ${tableName}: ${imageUrl}`);
        } else if (currentTemplate.background_image_show_link) {
          // Use template's background image for non-default templates
          imageUrl = currentTemplate.background_image_show_link;
          
          // Always replace any non-production URLs with production URL for email delivery
          // This ensures emails always use the correct production URL regardless of what's stored in DB
          const isLocalhost = imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1');
          const isWrongDomain = imageUrl.includes('api.imamdp.org') || 
                               imageUrl.includes('api.imamportal.com') ||
                               (imageUrl.includes('imamportal.com') && !imageUrl.startsWith('https://imamportal.com'));
          
          if (isLocalhost || isWrongDomain) {
            // Extract the path from the URL
            const urlMatch = imageUrl.match(/https?:\/\/[^\/]+(\/.*)/);
            const urlPath = urlMatch ? urlMatch[1] : '/api/emailTemplates/' + currentTemplate.id + '/view-image';
            imageUrl = `${API_BASE_URL}${urlPath}`;
            console.log(`📧 Replaced image URL from "${currentTemplate.background_image_show_link}" to "${imageUrl}"`);
          }
          
          // Ensure the URL is absolute and uses production domain
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            if (imageUrl.startsWith('/')) {
              imageUrl = `${API_BASE_URL}${imageUrl}`;
            } else {
              imageUrl = `${API_BASE_URL}/api${imageUrl}`;
            }
          }
          
          // Final check: if URL still contains localhost or wrong domain, force replace
          if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1') || 
              (imageUrl.includes('imamportal.com') && !imageUrl.startsWith('https://imamportal.com'))) {
            const urlMatch = imageUrl.match(/https?:\/\/[^\/]+(\/.*)/);
            const urlPath = urlMatch ? urlMatch[1] : '/api/emailTemplates/' + currentTemplate.id + '/view-image';
            imageUrl = `${API_BASE_URL}${urlPath}`;
            console.log(`📧 Force replaced image URL to production: ${imageUrl}`);
          }
          
          // Replace variables in HTML content
          htmlContent = htmlContent.replace(/\{\{background_image\}\}/g, imageUrl);
          htmlContent = htmlContent.replace(/\(\(background_image\)\)/g, imageUrl);
          
          // Also replace any localhost URLs that might be directly embedded in the HTML (safety net)
          htmlContent = htmlContent.replace(
            /https?:\/\/localhost:\d+\/api\/emailTemplates\/(\d+)\/view-image/g,
            `${API_BASE_URL}/api/emailTemplates/$1/view-image`
          );
          htmlContent = htmlContent.replace(
            /https?:\/\/127\.0\.0\.1:\d+\/api\/emailTemplates\/(\d+)\/view-image/g,
            `${API_BASE_URL}/api/emailTemplates/$1/view-image`
          );
          
          console.log(`📧 Final image URL used in email: ${imageUrl}`);
        } else if (!isDefaultSubmissionTemplate) {
          // If no show_link but image exists, generate it (only for non-default templates)
          if (currentTemplate.background_image && currentTemplate.id) {
            imageUrl = `${API_BASE_URL}/api/emailTemplates/${currentTemplate.id}/view-image`;
            console.log(`📧 Generated image URL for email: ${imageUrl}`);
          }
        }
        
        // Replace background_image variable with the determined image URL
        if (imageUrl) {
          htmlContent = htmlContent.replace(/\{\{background_image\}\}/g, imageUrl);
          htmlContent = htmlContent.replace(/\(\(background_image\)\)/g, imageUrl);
          console.log(`📧 Replaced background_image variable with: ${imageUrl}`);
        }

        // Replace login URL if present
        if (currentTemplate.login_url) {
          htmlContent = htmlContent.replace(/\{\{login_url\}\}/g, currentTemplate.login_url);
          htmlContent = htmlContent.replace(/\(\(login_url\)\)/g, currentTemplate.login_url);
        }

        // Determine recipients for this template
        const templateRecipients = [];
        
        // If specific recipient email is provided, use it (for Messages, etc.)
        if (specificRecipientEmail) {
          if (Array.isArray(specificRecipientEmail)) {
            templateRecipients.push(...specificRecipientEmail.filter(email => email && email.trim()));
          } else if (typeof specificRecipientEmail === 'string') {
            templateRecipients.push(specificRecipientEmail.trim());
          }
          console.log(`📧 Using specific recipient email(s):`, templateRecipients);
        } else {
          // Normal flow: determine recipients based on recipient_type
          if (recipientType === 'imam' || recipientType === 'both') {
            if (imamProfileId) {
              console.log(`📧 Fetching imam email for profile ID: ${imamProfileId}`);
              const imamEmail = await this.getImamEmail(imamProfileId);
              if (imamEmail) {
                templateRecipients.push(imamEmail);
                console.log(`✅ Imam email found: ${imamEmail}`);
              } else {
                console.warn(`⚠️ No email found for imam profile ID: ${imamProfileId}`);
              }
            } else {
              console.warn(`⚠️ No imam_profile_id provided but template requires imam recipient`);
            }
          }

          if (recipientType === 'admin' || recipientType === 'both') {
            console.log(`📧 Fetching admin emails...`);
            const adminEmails = await this.getAdminEmails();
            console.log(`📧 Admin emails found: ${adminEmails.length}`, adminEmails);
            templateRecipients.push(...adminEmails);
          }
        }

        if (templateRecipients.length === 0) {
          console.warn(`⚠️ No recipients found for template: ${currentTemplate.template_name}`);
          continue;
        }

        // Remove duplicates
        const uniqueRecipients = [...new Set(templateRecipients)];
        console.log(`📧 Sending email using template "${currentTemplate.template_name}" to ${uniqueRecipients.length} recipient(s):`, uniqueRecipients);
        console.log(`📧 Email Subject: ${subject}`);
        console.log(`📧 Email From: ${emailFrom}`);
        
        // Send emails for this template
        const emailPromises = uniqueRecipients.map(async (recipient) => {
          try {
            const result = await this.client.sendEmail({
              From: emailFrom,
              To: recipient,
              Subject: subject,
              HtmlBody: htmlContent,
              MessageStream: 'outbound',
            });
            console.log(`✅ Email sent successfully to ${recipient} using template "${currentTemplate.template_name}":`, {
              MessageID: result.MessageID,
              SubmittedAt: result.SubmittedAt,
              To: result.To,
              Subject: result.Subject
            });
            return { success: true, recipient, template: currentTemplate.template_name, result };
          } catch (err) {
            console.error(`❌ Failed to send email to ${recipient} using template "${currentTemplate.template_name}":`, {
              error: err.message,
              code: err.code,
              statusCode: err.statusCode
            });
            return { success: false, recipient, template: currentTemplate.template_name, error: err.message };
          }
        });

        const templateResults = await Promise.all(emailPromises);
        allResults.push(...templateResults);
      }

      if (allResults.length === 0) {
        console.error('❌ No emails were sent - no recipients found for any template');
        return { success: false, error: 'No recipients found' };
      }

      const successful = allResults.filter(r => r.success);
      const failed = allResults.filter(r => !r.success);

      const totalRecipients = allResults.length;
      if (failed.length > 0) {
        console.warn(`⚠️ ${failed.length} email(s) failed to send out of ${totalRecipients} total`);
      }

      const allRecipients = [...new Set(allResults.map(r => r.recipient))];
      const response = { 
        success: successful.length > 0, 
        recipients: allRecipients,
        successful: successful.length,
        failed: failed.length,
        results: allResults,
        message: `Email sent successfully to ${successful.length} recipient(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}`
      };

      console.log(`📧 Email sending completed:`, {
        total: totalRecipients,
        successful: successful.length,
        failed: failed.length,
        recipients: allRecipients
      });

      return response;
    } catch (error) {
      console.error('❌ Error sending email:', {
        error: error.message,
        stack: error.stack,
        tableName,
        action,
        recipients: recipients || 'N/A'
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, userName, resetLink) {
    try {
      if (!this.client) {
        console.error('❌ Postmark client not initialized. Check POSTMARK_SERVER_TOKEN in environment variables.');
        return { success: false, error: 'Email service not configured' };
      }

      const emailFrom = process.env.EMAIL_FROM || 'noreply@imamdp.org';
      
      // Get password reset email template from database
      const emailTemplateModel = require('../models/emailTemplateModel');
      let template = await emailTemplateModel.getByName('Password Reset - User Notification');
      
      let subject = 'Password Reset Request';
      let htmlContent = '';
      
      if (template && template.is_active) {
        // Use template from database
        subject = this.replaceVariables(template.subject, { user_name: userName });
        htmlContent = this.replaceVariables(template.html_content, {
          user_name: userName,
          reset_link: resetLink,
          expires_in: '15 minutes'
        });
        
        // Replace login URL if present
        if (template.login_url) {
          htmlContent = htmlContent.replace(/\{\{login_url\}\}/g, template.login_url);
          htmlContent = htmlContent.replace(/\(\(login_url\)\)/g, template.login_url);
        }
        
        // Handle background image
        if (template.background_image_show_link) {
          let imageUrl = template.background_image_show_link;
          // Use environment variable or detect production URL dynamically
          const API_BASE_URL = process.env.API_BASE_URL 
            || process.env.PRODUCTION_API_URL 
            || (process.env.NODE_ENV === 'production' ? 'https://imamportal.com' : 'http://localhost:5000');
          
          // Always replace any non-production URLs with production URL for email delivery
          const isLocalhost = imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1');
          const isWrongDomain = imageUrl.includes('api.imamdp.org') || 
                               imageUrl.includes('api.imamportal.com') ||
                               (imageUrl.includes('imamportal.com') && !imageUrl.startsWith('https://imamportal.com'));
          
          if (isLocalhost || isWrongDomain) {
            // Extract the path from the URL
            const urlMatch = imageUrl.match(/https?:\/\/[^\/]+(\/.*)/);
            const urlPath = urlMatch ? urlMatch[1] : '/api/emailTemplates/' + template.id + '/view-image';
            imageUrl = `${API_BASE_URL}${urlPath}`;
            console.log(`📧 Replaced image URL from "${template.background_image_show_link}" to "${imageUrl}"`);
          }
          
          // Ensure the URL is absolute and uses production domain
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            if (imageUrl.startsWith('/')) {
              imageUrl = `${API_BASE_URL}${imageUrl}`;
            } else {
              imageUrl = `${API_BASE_URL}/api${imageUrl}`;
            }
          }
          
          // Final check: if URL still contains localhost or wrong domain, force replace
          if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1') || 
              (imageUrl.includes('imamportal.com') && !imageUrl.startsWith('https://imamportal.com'))) {
            const urlMatch = imageUrl.match(/https?:\/\/[^\/]+(\/.*)/);
            const urlPath = urlMatch ? urlMatch[1] : '/api/emailTemplates/' + template.id + '/view-image';
            imageUrl = `${API_BASE_URL}${urlPath}`;
            console.log(`📧 Force replaced image URL to production: ${imageUrl}`);
          }
          
          htmlContent = htmlContent.replace(/\{\{background_image\}\}/g, imageUrl);
          htmlContent = htmlContent.replace(/\(\(background_image\)\)/g, imageUrl);
          
          // Also replace any localhost URLs that might be directly embedded in the HTML (safety net)
          htmlContent = htmlContent.replace(
            /https?:\/\/localhost:\d+\/api\/emailTemplates\/(\d+)\/view-image/g,
            `${API_BASE_URL}/api/emailTemplates/$1/view-image`
          );
          htmlContent = htmlContent.replace(
            /https?:\/\/127\.0\.0\.1:\d+\/api\/emailTemplates\/(\d+)\/view-image/g,
            `${API_BASE_URL}/api/emailTemplates/$1/view-image`
          );
        } else if (template.background_image && template.id) {
          // Use environment variable or detect production URL dynamically
          const API_BASE_URL = process.env.API_BASE_URL 
            || process.env.PRODUCTION_API_URL 
            || (process.env.NODE_ENV === 'production' ? 'https://imamportal.com' : 'http://localhost:5000');
          const imageUrl = `${API_BASE_URL}/api/emailTemplates/${template.id}/view-image`;
          htmlContent = htmlContent.replace(/\{\{background_image\}\}/g, imageUrl);
          htmlContent = htmlContent.replace(/\(\(background_image\)\)/g, imageUrl);
        }
      } else {
        // Fallback: use default template
        subject = 'Password Reset Request - Imam Development Plan';
        htmlContent = `
          <body style="background-color: #f7f5f5;">
            <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
              <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>Password Reset</b></h1>
              <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
                Asalaamu Alaikum ${userName || 'User'},
              </p>
              <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
                You have requested to reset your password for your Imam Development Plan account.
              </p>
              <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
                Click the button below to reset your password. This link will expire in 15 minutes.
              </p>
              <a href="${resetLink}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
                RESET PASSWORD
              </a>
              <p style="color:#666;font-size:14px;line-height:1.6;margin-top:20px;text-align:left;">
                If you did not request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
                Kind regards,<br/>
                Imam Development Plan<br/>
                helpdesk@imamdp.org
              </p>
            </div>
          </body>
        `;
      }
      
      const result = await this.client.sendEmail({
        From: emailFrom,
        To: email,
        Subject: subject,
        HtmlBody: htmlContent,
        MessageStream: 'outbound',
      });
      
      console.log(`✅ Password reset email sent successfully to ${email}:`, {
        MessageID: result.MessageID,
        SubmittedAt: result.SubmittedAt,
        To: result.To,
        Subject: result.Subject
      });
      
      return { success: true, result };
    } catch (err) {
      console.error(`❌ Failed to send password reset email to ${email}:`, {
        error: err.message,
        code: err.code,
        statusCode: err.statusCode
      });
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();

