/**
 * Virgo Electronics website: enquiry webhook.
 *
 * Paste this into Extensions > Apps Script of the Google Sheet that should
 * receive enquiries. Setup steps are in docs/ENQUIRY_SETUP.md.
 *
 * Script Properties (Project Settings > Script Properties), both optional:
 *   NOTIFY_EMAIL    the address that gets an email for every enquiry.
 *                   Without it the email goes to the Google account that owns this script.
 *   ENQUIRY_SECRET  if set, requests must carry the same value
 *                   (ENQUIRY_WEBHOOK_SECRET in Vercel). Without it the web app
 *                   address itself is the only key, so keep that address private.
 *
 * The website treats an enquiry as delivered only when this script answers
 * {"ok": true}. Answer that only after the row is written.
 */

var SHEET_NAME = "Enquiries";
var HEADER = ["Received at", "Reference", "Type", "Name", "Mobile", "City", "Details"];

var TYPE_NAMES = {
  dealer: "Dealer",
  distributor: "Distributor",
  bulk: "Bulk order",
  product: "Product",
  general: "General",
};

var FIELD_NAMES = {
  shopName: "Shop name",
  firmName: "Firm name",
  organisation: "Organisation",
  pin: "PIN code",
  email: "Email",
  state: "State",
  territory: "Area wanted",
  yearsInTrade: "Years in trade",
  brandsHandled: "Brands handled",
  gstin: "GSTIN",
  categories: "Product ranges",
  items: "Models and quantities",
  deliveryCity: "Delivery city",
  neededBy: "Needed by",
  buyerType: "For",
  message: "Message",
};

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var expected = props.getProperty("ENQUIRY_SECRET");
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (expected && data.secret !== expected) {
      return reply({ ok: false, error: "unauthorised" });
    }
    if (!data.reference || !data.type || !data.fields) {
      return reply({ ok: false, error: "bad request" });
    }

    var fields = data.fields;
    var details = {};
    Object.keys(fields).forEach(function (key) {
      if (key !== "name" && key !== "mobile" && key !== "city") details[key] = fields[key];
    });
    if (data.page) details.page = data.page;
    if (data.product) details.product = data.product;

    var lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      var sheet = getSheet();
      sheet.appendRow(
        [
          new Date(),
          data.reference,
          TYPE_NAMES[data.type] || data.type,
          fields.name,
          fields.mobile,
          fields.city,
          describe(details),
        ].map(safeCell),
      );
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    // The row is saved. A failed email is logged but does not fail the enquiry.
    var notify = props.getProperty("NOTIFY_EMAIL") || Session.getEffectiveUser().getEmail();
    if (notify) {
      try {
        sendSummary(notify, data);
      } catch (mailErr) {
        console.error("Email failed for " + data.reference + ": " + mailErr);
      }
    }

    return reply({ ok: true });
  } catch (err) {
    console.error("Enquiry webhook failed: " + err);
    return reply({ ok: false, error: "failed" });
  }
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** "Shop name: Sharma Electricals | PIN code: 201001 | ..." for the Details column. */
function describe(details) {
  return Object.keys(details)
    .map(function (key) {
      var value = details[key];
      if (value && typeof value === "object" && !Array.isArray(value)) value = value.name || JSON.stringify(value);
      if (Array.isArray(value)) value = value.join(", ");
      if (value === "" || value === undefined || value === null) return "";
      return (FIELD_NAMES[key] || key) + ": " + value;
    })
    .filter(function (part) {
      return part !== "";
    })
    .join(" | ");
}

/** Stops a value such as "=HYPERLINK(...)" from running as a formula in the Sheet. */
function safeCell(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value;
  var text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function sendSummary(to, data) {
  var f = data.fields;
  var type = TYPE_NAMES[data.type] || data.type;
  var lines = [
    type + " enquiry from the website",
    "",
    "Reference: " + data.reference,
    "Name: " + f.name,
    "Mobile: " + f.mobile,
    "City: " + f.city,
  ];
  Object.keys(f).forEach(function (key) {
    if (key === "name" || key === "mobile" || key === "city") return;
    var value = Array.isArray(f[key]) ? f[key].join(", ") : f[key];
    if (value === "" || value === undefined || value === null) return;
    lines.push((FIELD_NAMES[key] || key) + ": " + value);
  });
  if (data.product && data.product.name) lines.push("Product: " + data.product.name + " (" + data.product.path + ")");
  if (data.page) lines.push("Sent from: " + data.page);
  lines.push("Sent at: " + data.submittedAt);

  var options = {
    to: to,
    subject: type + " enquiry " + data.reference + ": " + f.name + ", " + f.city,
    body: lines.join("\n"),
  };
  if (f.email) options.replyTo = f.email;
  MailApp.sendEmail(options);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
