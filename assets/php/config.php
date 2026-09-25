<?php
/**
 * Glossary Skin — Weight Management Landing Page
 * Backend configuration. Edit the values below after uploading to Hostinger.
 * Do not rename these constants — submit-lead.php references them directly.
 */

// ---- Email -----------------------------------------------------------------
// PHP's built-in mail() works out of the box on most Hostinger plans. If you
// need more reliable delivery (SPF/DKIM-aligned sending), switch to SMTP via
// PHPMailer — see the commented block in submit-lead.php's send_email().
define('EMAIL_FROM', 'Glossary Skin <appointments@glossaryskin.com>');
define('EMAIL_FROM_NAME', 'Glossary Skin');

// Comma-separated internal recipients — every weight-management lead is sent here.
define('INTERNAL_NOTIFICATION_EMAILS', 'glossaryappointments@gmail.com');

// Optional SMTP settings (only used if USE_SMTP is true and PHPMailer is
// installed via Composer — composer require phpmailer/phpmailer).
define('USE_SMTP', false);
define('SMTP_HOST', '');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');
define('SMTP_SECURE', 'tls');

// ---- Google Sheet lead log ---------------------------------------------------
// Keep this BLANK. The browser already posts every lead straight to the
// Sheet (googleSheetWebhookUrl in assets/js/config.js); setting a URL here
// as well would write every lead to the Sheet twice. Only fill it in if the
// browser-side webhook is removed from config.js.
define('GOOGLE_SHEET_WEBHOOK_URL', '');

// ---- Misc --------------------------------------------------------------------
define('LEADS_LOG_FILE', __DIR__ . '/leads/leads.csv');
