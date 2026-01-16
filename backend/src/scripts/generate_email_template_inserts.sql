-- ============================================================
-- SQL Query to Generate INSERT Statements from Existing Email Templates
-- ============================================================
-- Run this query in your database to generate INSERT statements
-- for all existing email templates. Copy the output and paste it
-- into the schema.sql file in the Email Templates section.
-- ============================================================

SELECT 
  'INSERT INTO Email_Templates (' ||
  'template_name, subject, html_content, background_color, text_color, ' ||
  'button_color, button_text_color, image_position, text_alignment, ' ||
  'available_variables, recipient_type, is_active, login_url, email_triggers, Created_By, Updated_By' ||
  ') VALUES (' ||
  quote_literal(template_name) || ', ' ||
  quote_literal(subject) || ', ' ||
  quote_literal(html_content) || ', ' ||
  COALESCE(quote_literal(background_color), 'NULL') || ', ' ||
  COALESCE(quote_literal(text_color), 'NULL') || ', ' ||
  COALESCE(quote_literal(button_color), 'NULL') || ', ' ||
  COALESCE(quote_literal(button_text_color), 'NULL') || ', ' ||
  COALESCE(quote_literal(image_position), 'NULL') || ', ' ||
  COALESCE(quote_literal(text_alignment), 'NULL') || ', ' ||
  COALESCE(quote_literal(available_variables), 'NULL') || ', ' ||
  quote_literal(recipient_type) || ', ' ||
  is_active::text || ', ' ||
  COALESCE(quote_literal(login_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(email_triggers), 'NULL') || ', ' ||
  quote_literal(COALESCE(Created_By, 'system')) || ', ' ||
  quote_literal(COALESCE(Updated_By, 'system')) ||
  ') ON CONFLICT (template_name) DO NOTHING;' AS insert_statement
FROM Email_Templates
ORDER BY id;

