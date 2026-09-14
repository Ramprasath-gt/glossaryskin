# Logging leads to a Google Sheet

This lets every booking submission append a row to a Google Sheet, with no
database required. It's optional — the form works without it (email + local
CSV backup still capture every lead).

Leads are split across two tabs in the same spreadsheet:

- **Sheet1** — Step-1-only leads (name/mobile/email/city/interest) who have
  **not** finished the rest of the form yet. Use this as your "follow up with
  these people" list.
- **Sheet2** — leads who completed all 3 steps, with the full appointment +
  address details.

"Interest"/"Program" values are one of the five options a visitor can pick
in the form — matching the five Meta ad audiences: `GLP-1 Weight Management`,
`Abdomen Inch Loss`, `Hips Inch Loss`, `Thighs Inch Loss`, or
`I'm Not Sure — Help Me Choose`.

This is exclusive, not additive: if someone who's in Sheet1 goes on to
finish the form, their Sheet1 row is automatically deleted and a full row is
added to Sheet2 instead — so nobody sits in both tabs. Both tabs are created
automatically on first submission if they don't already exist (Sheet1
usually exists by default in a new spreadsheet; Sheet2 is added by the
script the first time someone completes the form).

## 1. Add the Apps Script

Open the target spreadsheet: **Extensions → Apps Script**, delete the
placeholder code, and paste:

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var isPartial = data.stage === "partial";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (isPartial) {
    var sheet1 = ss.getSheetByName("Sheet1") || ss.insertSheet("Sheet1");
    if (sheet1.getLastRow() === 0) {
      sheet1.appendRow(["Timestamp", "Full Name", "Mobile", "Email", "City", "Interest"]);
    }
    sheet1.appendRow([new Date(), data.fullName, data.mobile, data.email, data.city, data.programName]);
    return respond();
  }

  // Complete submission — remove any earlier partial row for this mobile
  // number from Sheet1 (if present), then log the full lead into Sheet2.
  var sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1 && sheet1.getLastRow() > 1) {
    var mobiles = sheet1.getRange(2, 3, sheet1.getLastRow() - 1, 1).getValues();
    for (var i = mobiles.length - 1; i >= 0; i--) {
      if (String(mobiles[i][0]) === String(data.mobile)) {
        sheet1.deleteRow(i + 2);
        break;
      }
    }
  }

  var sheet2 = ss.getSheetByName("Sheet2") || ss.insertSheet("Sheet2");
  if (sheet2.getLastRow() === 0) {
    sheet2.appendRow([
      "Timestamp", "Full Name", "Mobile", "Email", "City", "Interest",
      "Date", "Time", "House/Flat", "Area",
      "Address", "Pincode", "Phone", "Latitude", "Longitude",
    ]);
  }
  sheet2.appendRow([
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
