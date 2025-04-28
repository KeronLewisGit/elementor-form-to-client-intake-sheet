/**
 * --------------------------------------------------------------------------------
 * Mixers Anonymous TT – Client Intake Webhook (Template with Dummy Data)
 *
 * A Google Apps Script template for handling Elementor form submissions:
 *  - Copies a “Client Intake Form” sheet into a new tab
 *  - Populates it with incoming form data
 *  - Returns a plain-text HTML acknowledgment
 *
 * HOW TO USE:
 * 1. Copy this file into your Apps Script editor (Code.gs).
 * 2. Set CONFIGURATION values (SPREADSHEET_ID, TEMPLATE_SHEET_NAME, FIELD_MAP).
 * 3. Deploy as a Web App:
 *    • Extensions → Apps Script → Deploy → New deployment → Web app
 *    • Execute as: Me
 *    • Who has access: Anyone (even anonymous)
 * 4. Point your Elementor form’s webhook URL to the returned Web App URL.
 *
 * TESTING WITH DUMMY DATA:
 * - Use the `testWebhook` function in Apps Script editor to simulate a POST with dummy data.
 * - Logs and sheet creation can be observed without an actual webhook.
 *
 * --------------------------------------------------------------------------------
 */

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────

/** @constant {string} ID of the target Google Spreadsheet */
const SPREADSHEET_ID      = '12345678'; //*Your Spreadsheet ID goes here.

/** @constant {string} Name of the template sheet to copy for each submission */
const TEMPLATE_SHEET_NAME = ''; //*Your Template Name goes here.

/**
 * @constant {Object.<string,string>}
 * Maps JSON field names to A1 notation cells in the template copy.
 */
const FIELD_MAP = {
  'First Name':            'E5',   // First Name
  'Last Name':             'L5',   // Last Name
  'Email':                 'E11',  // Email Address
  'Telephone':             'E9',   // Phone Number
  'Type of Event/Service': 'E13',  // Event Type
  'No. of Guests':         'F17',  // Estimated Guest Count
  'Glasses Needed':        'L17',  // Glassware Needed
  'Hours of Service':      'L11',  // Event Duration
  'Event Date':            'F7',   // Event Date
  'No. of Bartenders':     'F35'   // Number of Bartenders
};

/**
 * DUMMY_DATA for local testing.
 * Run `testWebhook()` to simulate a form submission.
 */
const DUMMY_DATA = {
  'First Name': 'Jane',
  'Last Name': 'Doe',
  'Email': 'jane.doe@example.com',
  'Telephone': '123-456-7890',
  'Type of Event/Service': 'Corporate Function',
  'No. of Guests': '50',
  'Glasses Needed': 'Yes',
  'Hours of Service': '4',
  'Event Date': '2025-05-01',
  'No. of Bartenders': '3'
};


// ──────────────────────────────────────────────────────────────────────────────
// ENTRY POINTS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * doGet
 * Health-check endpoint. Returns HTTP 200 with JSON `{ status: 'ok' }`.
 * Allows testers to verify the webhook URL.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * doPost
 * Main handler for incoming webhook POST from Elementor.
 * Follows these steps:
 *   1. Parses JSON or URL-encoded payload
 *   2. Copies the template sheet
 *   3. Renames the new sheet to "First Last YYYY-MM-DDTHH:mm:ss"
 *   4. Populates mapped fields from payload
 *   5. Returns a simple HTML acknowledgment (200 OK)
 */
function doPost(e) {
  try {
    // 1) Parse incoming form data
    const formData = parseFormData(e);

    // 2) Open spreadsheet & fetch template sheet
    const ss       = SpreadsheetApp.openById(SPREADSHEET_ID);
    const template = ss.getSheetByName(TEMPLATE_SHEET_NAME);
    if (!template) {
      throw new Error(`Template sheet "${TEMPLATE_SHEET_NAME}" not found`);
    }

    // 3) Copy the template and generate a unique name
    const newName  = makeSheetName(formData, ss.getSpreadsheetTimeZone());
    const newSheet = template.copyTo(ss).setName(newName);

    // 4) Populate each mapped field if present
    Object.entries(FIELD_MAP).forEach(([key, cellA1]) => {
      if (formData[key] !== undefined) {
        newSheet.getRange(cellA1).setValue(formData[key]);
      }
    });

    // 5) Acknowledge receipt
    return HtmlService.createHtmlOutput("Form data received");

  } catch (err) {
    console.error('doPost error:', err);
    // Always return 200 OK to avoid webhook failure
    return HtmlService.createHtmlOutput("Error: " + err.message);
  }
}


// ──────────────────────────────────────────────────────────────────────────────
// TESTING FUNCTION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * testWebhook
 * Simulates a POST event using DUMMY_DATA so you can test without a real webhook.
 * Run this manually in the Apps Script editor.
 */
function testWebhook() {
  const fakeEvent = { parameter: DUMMY_DATA };
  const response  = doPost(fakeEvent);
  Logger.log(response.getContent());
}


// ──────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * parseFormData
 * Extracts JSON or URL-encoded parameters from the POST event.
 */
function parseFormData(e) {
  if (
    e.postData &&
    e.postData.contents &&
    e.postData.type.indexOf('application/json') === 0
  ) {
    return JSON.parse(e.postData.contents);
  }
  // Fallback to URL-encoded form parameters
  return e.parameter || {};
}


/**
 * makeSheetName
 * Creates a safe, unique sheet name: "First Last YYYY-MM-DDTHH:mm:ss"
 */
function makeSheetName(data, tz) {
  const first     = sanitize(data['First Name']);
  const last      = sanitize(data['Last Name']);
  const timestamp = Utilities.formatDate(
    new Date(), tz, "yyyy-MM-dd'T'HH:mm:ss"
  );
  return [first, last, timestamp]
    .filter(Boolean)
    .join(' ')
    .slice(0, 99);
}


/**
 * sanitize
 * Removes characters invalid in Google sheet names.
 */
function sanitize(str) {
  return (str || '')
    .replace(/[[\]*?:\/\\]/g, '')
    .trim();
}
