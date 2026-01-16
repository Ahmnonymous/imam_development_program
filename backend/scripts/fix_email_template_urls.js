// Script to fix email template URLs in database
// Updates all background_image_show_link values that contain localhost to use production URL

require('dotenv').config();
const pool = require('../src/config/db');

const PRODUCTION_URL = process.env.API_BASE_URL 
  || process.env.PRODUCTION_API_URL 
  || (process.env.NODE_ENV === 'production' ? 'https://imamportal.com' : 'http://localhost:5000');

async function fixEmailTemplateUrls() {
  try {
    console.log('🔍 Checking for email templates with localhost URLs...');
    
    // Find all templates with localhost URLs
    const query = `
      SELECT id, template_name, background_image_show_link 
      FROM Email_Templates 
      WHERE background_image_show_link IS NOT NULL 
      AND (
        background_image_show_link LIKE '%localhost%' 
        OR background_image_show_link LIKE '%127.0.0.1%'
        OR background_image_show_link LIKE '%api.imamdp.org%'
      )
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('✅ No templates found with localhost URLs');
      return;
    }
    
    console.log(`📋 Found ${result.rows.length} template(s) with localhost URLs:`);
    result.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.template_name}`);
      console.log(`    Old URL: ${row.background_image_show_link}`);
    });
    
    // Update each template
    for (const template of result.rows) {
      const oldUrl = template.background_image_show_link;
      
      // Extract the path from the old URL
      const urlMatch = oldUrl.match(/https?:\/\/[^\/]+(\/.*)/);
      const urlPath = urlMatch ? urlMatch[1] : `/api/emailTemplates/${template.id}/view-image`;
      const newUrl = `${PRODUCTION_URL}${urlPath}`;
      
      // Update the database
      const updateQuery = `
        UPDATE Email_Templates 
        SET background_image_show_link = $1,
            updated_at = now()
        WHERE id = $2
        RETURNING id, template_name, background_image_show_link
      `;
      
      const updateResult = await pool.query(updateQuery, [newUrl, template.id]);
      
      if (updateResult.rows[0]) {
        console.log(`✅ Updated template ID ${template.id}:`);
        console.log(`   Old: ${oldUrl}`);
        console.log(`   New: ${newUrl}`);
      }
    }
    
    console.log('\n✅ All email template URLs have been updated!');
    
  } catch (error) {
    console.error('❌ Error fixing email template URLs:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  fixEmailTemplateUrls()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixEmailTemplateUrls };

