<?php
/**
 * Glossary Skin — Weight Management Landing Page
 * Receives the booking form submission (fetch POST, JSON body), validates it,
 * emails the customer + internal team, forwards a row to Google Sheets (if
 * configured), and keeps a local CSV backup so a lead is never silently lost
 * even if email/Sheets both fail.
 */

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

// The form posts same-origin; only the live landing page may call this
// endpoint from a browser.
header('Access-Control-Allow-Origin: https://weightloss.glossaryskin.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

$raw = file_get_contents('php://input');
$lead = json_decode($raw, true);

if (!is_array($lead)) {
    respond(false, 'Invalid request body.', 400);
}

// ---- Validation --------------------------------------------------------------
// A "partial" submission fires right after Step 1 (name/mobile/email/city/
// interest) so a lead is captured even if the visitor never finishes the rest
// of the form. It gets the same treatment as a full lead (logged + emailed to
// the team) but with a relaxed required-field list and no customer
// confirmation email (there's no appointment to confirm yet).
$isPartial = (($lead['leadStage'] ?? '') === 'partial');

$required = $isPartial
    ? ['fullName', 'mobile', 'email', 'city'] // interest is only chosen on step 2
    : [
        'fullName', 'mobile', 'email', 'city', 'preferredProgram',
        'appointmentDate', 'appointmentTime', 'address', 'pincode', 'phone',
    ];
foreach ($required as $field) {
    if (empty($lead[$field]) || trim((string) $lead[$field]) === '') {
        respond(false, "Missing required field: $field", 400);
    }
}

if (!preg_match('/^[6-9]\d{9}$/', preg_replace('/\D/', '', $lead['mobile']))) {
    respond(false, 'Invalid mobile number.', 400);
}

if (!$isPartial) {
    if (empty($lead['consent'])) {
        respond(false, 'Consent to be contacted is required.', 400);
    }

    if (!preg_match('/^\d{6}$/', trim($lead['pincode']))) {
        respond(false, 'Invalid pincode.', 400);
    }

    $today = new DateTime('today');
    try {
        $appointmentDate = new DateTime($lead['appointmentDate']);
    } catch (Exception $e) {
        respond(false, 'Invalid appointment date.', 400);
    }
    if ($appointmentDate < $today) {
        respond(false, 'Appointment date cannot be in the past.', 400);
    }
}

// Sanitize all string fields for safe use in emails / CSV / Sheets. Stripping
// \r\n is required, not cosmetic — a raw newline in a field that ends up in
// an email subject/header (e.g. fullName) is a classic header-injection
// vector (CRLF injection) that lets an attacker append Bcc:/additional
// headers to outgoing mail.
foreach ($lead as $key => $value) {
    if (is_string($value)) {
        $lead[$key] = trim(preg_replace('/[\r\n]+/', ' ', strip_tags($value)));
    }
}

$programNames = [
    'glp1'     => 'GLP-1 Weight Management',
    'abdomen'  => 'Abdomen Inch Loss',
    'hips'     => 'Hips Inch Loss',
    'thighs'   => 'Thighs Inch Loss',
    'not-sure' => "I'm Not Sure — Help Me Choose",
];
$programKey = $lead['preferredProgram'] ?? '';
$programName = $programKey === '' ? 'Not yet selected' : ($programNames[$programKey] ?? $programKey);

// ---- Persist locally (never lose a lead even if email/Sheets fail) -----------
log_lead_to_csv($lead, $programName, $isPartial);

// ---- Email ---------------------------------------------------------------
$emailResult = send_lead_emails($lead, $programName, $isPartial);

// ---- Google Sheet ----------------------------------------------------------
if (GOOGLE_SHEET_WEBHOOK_URL !== '') {
    forward_to_google_sheet($lead, $programName, $isPartial);
}

respond(true, null, 200, ['emailSent' => $emailResult['sent'], 'customerEmailSent' => $emailResult['customerEmailSent']]);

// =============================================================================
// Helpers
// =============================================================================

function respond($ok, $error = null, $status = 200, $extra = [])
{
    http_response_code($status);
    echo json_encode(array_merge(['ok' => $ok, 'error' => $error], $extra));
    exit;
}

function log_lead_to_csv($lead, $programName, $isPartial)
{
    $dir = dirname(LEADS_LOG_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
        // Block direct web access to the CSV backup.
        file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }

    $isNew = !file_exists(LEADS_LOG_FILE);
    $fh = fopen(LEADS_LOG_FILE, 'a');
    if (!$fh) return;

    if ($isNew) {
        fputcsv($fh, [
            'Timestamp', 'Stage', 'Full Name', 'Mobile', 'Email', 'City', 'Interest',
            'Date', 'Time', 'House/Flat', 'Area',
            'Address', 'Pincode', 'Phone', 'Latitude', 'Longitude',
        ]);
    }

    fputcsv($fh, [
        date('Y-m-d H:i:s'), $isPartial ? 'Partial (Step 1)' : 'Complete',
        $lead['fullName'] ?? '', $lead['mobile'] ?? '', $lead['email'] ?? '', $lead['city'] ?? '', $programName,
        $lead['appointmentDate'] ?? '', $lead['appointmentTime'] ?? '', $lead['houseNumber'] ?? '', $lead['area'] ?? '',
        $lead['address'] ?? '', $lead['pincode'] ?? '', $lead['phone'] ?? '',
        $lead['latitude'] ?? '', $lead['longitude'] ?? '',
    ]);
    fclose($fh);
}

function format_date_pretty($dateISO)
{
    try {
        return (new DateTime($dateISO))->format('l, j F Y');
    } catch (Exception $e) {
        return $dateISO;
    }
}

function send_lead_emails($lead, $programName, $isPartial)
{
    $customerEmailSent = false;

    // ---- Internal notification ----
    $internalSubject = $isPartial
        ? "New Step 1 Lead (not yet completed): {$lead['fullName']}"
        : "New Lead: {$lead['fullName']} — {$programName}";
    $internalBody = internal_email_html($lead, $programName, $isPartial);
    $sent = send_email(INTERNAL_NOTIFICATION_EMAILS, $internalSubject, $internalBody);

    // ---- Customer confirmation (only on a completed booking, and only if
    // they gave a well-formed email) — a partial Step-1 lead has no
    // appointment yet, so there is nothing to confirm to the customer.
    if (!$isPartial && !empty($lead['email']) && filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
        $customerSubject = 'Your Glossary Skin Weight Management Consultation';
        $customerBody = customer_email_html($lead, $programName);
        $customerEmailSent = send_email($lead['email'], $customerSubject, $customerBody);
    }

    return ['sent' => $sent, 'customerEmailSent' => $customerEmailSent];
}

/**
 * Sends one HTML email. Uses PHP's built-in mail() by default. To switch to
 * SMTP (recommended for real deliverability), set USE_SMTP = true in
 * config.php, run `composer require phpmailer/phpmailer` in this folder, and
 * uncomment the PHPMailer block below.
 */
function send_email($to, $subject, $htmlBody)
{
    /*
    if (USE_SMTP) {
        require __DIR__ . '/vendor/autoload.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = SMTP_SECURE;
            $mail->Port = SMTP_PORT;
            $mail->setFrom(EMAIL_FROM, EMAIL_FROM_NAME);
            foreach (explode(',', $to) as $addr) $mail->addAddress(trim($addr));
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            return $mail->send();
        } catch (Exception $e) {
            error_log('[email] PHPMailer send failed: ' . $e->getMessage());
            return false;
        }
    }
    */

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . EMAIL_FROM . "\r\n";

    $ok = @mail($to, $subject, $htmlBody, $headers);
    if (!$ok) {
        error_log("[email] mail() failed for subject: $subject");
    }
    return $ok;
}

function e($value)
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function customer_email_html($lead, $programName)
{
    $pincode = $lead['pincode'] ?? '';
    return '
    <div style="font-family:Georgia,serif;background:#faf6ef;padding:32px;color:#123529;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dde8e2;border-radius:12px;overflow:hidden;">
        <div style="background:#123529;padding:24px 32px;">
          <h1 style="color:#faf6ef;font-size:20px;margin:0;letter-spacing:0.04em;">GLOSSARY</h1>
          <p style="color:#c9d3c4;font-size:11px;letter-spacing:0.2em;margin:4px 0 0;">BEAUTY SCIENTIFICALLY PERFECTED</p>
        </div>
        <div style="padding:32px;">
          <h2 style="font-size:20px;margin:0 0 8px;">You\'re All Set, ' . e($lead['fullName']) . '.</h2>
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#2c5747;">
            Your consultation request has been received. Our team will be in touch with you shortly to confirm the details below.
          </p>
          <table style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:14px;margin-top:20px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#5f8f79;">Program</td><td style="padding:8px 0;text-align:right;font-weight:600;">' . e($programName) . '</td></tr>
            <tr><td style="padding:8px 0;color:#5f8f79;border-top:1px solid #eef1ea;">Date</td><td style="padding:8px 0;text-align:right;font-weight:600;border-top:1px solid #eef1ea;">' . e(format_date_pretty($lead['appointmentDate'])) . '</td></tr>
            <tr><td style="padding:8px 0;color:#5f8f79;border-top:1px solid #eef1ea;">Time</td><td style="padding:8px 0;text-align:right;font-weight:600;border-top:1px solid #eef1ea;">' . e($lead['appointmentTime']) . '</td></tr>
            <tr><td style="padding:8px 0;color:#5f8f79;border-top:1px solid #eef1ea;">Pincode</td><td style="padding:8px 0;text-align:right;font-weight:600;border-top:1px solid #eef1ea;">' . e($pincode) . '</td></tr>
          </table>
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#5f8f79;margin-top:24px;">
            Please keep your phone available — our team will call you on ' . e($lead['phone']) . ' to confirm your consultation.
          </p>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eef1ea;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8bb29d;">
            <p style="margin:0 0 4px;">Glossary Skin · B-62, Sector 2, Noida, Uttar Pradesh – 201301</p>
            <p style="margin:0;">+91 98218 21567 · glossaryappointments@gmail.com</p>
          </div>
        </div>
      </div>
    </div>';
}

function internal_email_html($lead, $programName, $isPartial)
{
    $rows = [
        'Full Name' => $lead['fullName'] ?? '',
        'Mobile' => $lead['mobile'] ?? '',
        'Email' => $lead['email'] ?? '—',
        'City' => $lead['city'] ?? '',
        'Interested In' => $programName,
    ];

    if ($isPartial) {
        $rows['Status'] = 'Filled Step 1 only — has not completed the booking form yet. Follow up directly.';
    } else {
        $rows['Appointment Date'] = format_date_pretty($lead['appointmentDate'] ?? '');
        $rows['Appointment Time'] = $lead['appointmentTime'] ?? '';
        $rows['Address'] = $lead['address'] ?? '';
        $rows['Pincode'] = $lead['pincode'] ?? '';
        $rows['Contact Phone'] = $lead['phone'] ?? '';
    }

    $rowsHtml = '';
    foreach ($rows as $label => $value) {
        $rowsHtml .= '<tr><td style="padding:6px 16px 6px 0;color:#5f8f79;vertical-align:top;">' . e($label) . '</td><td style="padding:6px 0;font-weight:600;">' . e($value ?: '—') . '</td></tr>';
    }

    return '
    <div style="font-family:Helvetica,Arial,sans-serif;padding:24px;color:#123529;">
      <h2 style="margin:0 0 16px;">' . ($isPartial ? 'New Step 1 Lead (Partial)' : 'New Weight Management Lead') . '</h2>
      <table style="border-collapse:collapse;font-size:14px;">' . $rowsHtml . '</table>
    </div>';
}

/**
 * Forwards the lead to a Google Sheet via an Apps Script Web App (see
 * GOOGLE_APPS_SCRIPT.md). Fire-and-forget with a short timeout — a slow or
 * failing Sheet must never block the customer's booking confirmation.
 */
function forward_to_google_sheet($lead, $programName, $isPartial)
{
    $payload = json_encode(array_merge($lead, [
        'programName' => $programName,
        'receivedAt' => date('c'),
        'stage' => $isPartial ? 'partial' : 'complete',
    ]));

    $ch = curl_init(GOOGLE_SHEET_WEBHOOK_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    curl_exec($ch);
    if (curl_errno($ch)) {
        error_log('[sheet] forward failed: ' . curl_error($ch));
    }
    curl_close($ch);
}
