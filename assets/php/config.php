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
// Leave blank to skip. Every submission is forwarded here, split across two
// tabs: Step1 gets Step-1-only leads who haven't finished the form yet,
// Final gets leads who completed all 4 steps (a Step1 row is removed once
// that same lead completes, so nobody sits in both). To enable:
//   1. Open the target Google Sheet: Extensions > Apps Script, paste the
//      doPost() snippet from /assets/php/GOOGLE_APPS_SCRIPT.md, then
//      Deploy > Web app (execute as: Me, who has access: Anyone).
//   2. Paste the deployment URL below.
define('GOOGLE_SHEET_WEBHOOK_URL', 'https://script.google.com/macros/s/AKfycbzbOp0FCQ0_re7rBEBC12UxIJ9OlapM9SYL8nuBLttKZeYYJPQ7t32yoaeSxAkzIOooOg/exec');

// ---- Misc --------------------------------------------------------------------
define('LEADS_LOG_FILE', __DIR__ . '/leads/leads.csv');
