# Logging leads to a Google Sheet

This lets every booking submission append a row to a Google Sheet, with no
database required. It's optional — the form works without it (email + local
CSV backup still capture every lead).

Leads are split across two tabs in the same spreadsheet:

- **Step1** — Step-1-only leads (name/mobile/email/city/interest) who have
  **not** finished the rest of the form yet. Use this as your "follow up with
  these people" list.
- **Final** — leads who completed all 4 steps, with the full appointment +
  address details.

"Interest"/"Program" values are one of the five options a visitor can pick
in the form — matching the five Meta ad audiences: `GLP-1 Weight Management`,
`Abdomen Inch Loss`, `Hips Inch Loss`, `Thighs Inch Loss`, or
`I'm Not Sure — Help Me Choose`.

This is exclusive, not additive: if someone who's in Step1 goes on to
finish the form, their Step1 row is automatically deleted and a full row is
added to Final instead — so nobody sits in both tabs. Both tabs are created
automatically on first submission if they don't already exist.

## 1. Add the Apps Script

Open the target spreadsheet: **Extensions → Apps Script**, delete the
placeholder code, and paste:

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var isPartial = data.stage === "partial";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (isPartial) {
    var step1 = ss.getSheetByName("Step1") || ss.insertSheet("Step1");
    if (step1.getLastRow() === 0) {
      step1.appendRow(["Timestamp", "Full Name", "Mobile", "Email", "City", "Interest"]);
    }
    step1.appendRow([new Date(), data.fullName, data.mobile, data.email, data.city, data.programName]);
    return respond();
  }

  // Complete submission — remove any earlier partial row for this mobile
  // number from Step1 (if present), then log the full lead into Final.
  var step1 = ss.getSheetByName("Step1");
  if (step1 && step1.getLastRow() > 1) {
    var mobiles = step1.getRange(2, 3, step1.getLastRow() - 1, 1).getValues();
    for (var i = mobiles.length - 1; i >= 0; i--) {
      if (String(mobiles[i][0]) === String(data.mobile)) {
        step1.deleteRow(i + 2);
        break;
      }
    }
  }

  var final = ss.getSheetByName("Final") || ss.insertSheet("Final");
  if (final.getLastRow() === 0) {
    final.appendRow([
      "Timestamp", "Full Name", "Mobile", "Email", "City", "Interest",
      "Date", "Time", "House/Flat", "Area",
      "Address", "Pincode", "Phone", "Latitude", "Longitude",
    ]);
  }
  final.appendRow([
    new Date(), data.fullName, data.mobile, data.email || "", data.city, data.programName || "",
    data.appointmentDate || "", data.appointmentTime || "", data.houseNumber || "",
    data.area || "", data.address || "", data.pincode || "", data.phone || "",
    data.latitude || "", data.longitude || "",
  ]);
  return respond();
}

function respond() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 2. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Click **Deploy** and copy the Web app URL (ends in `/exec`).

## 3. Connect it

Paste that URL into `GOOGLE_SHEET_WEBHOOK_URL` in `assets/php/config.php`.

That's it — `submit-lead.php` posts every validated lead to this URL
server-side (avoiding browser CORS issues) after it has already logged the
lead locally and attempted the confirmation emails, so a slow or misconfigured
Sheet never blocks a customer's booking.
