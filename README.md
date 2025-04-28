# Client Intake Webhook Script
<p align="center">
  <img src="https://github.com/user-attachments/assets/38c6caa9-edfc-4f2c-a16d-10206df834ec" width="45%" />
  <img src="https://github.com/user-attachments/assets/de1358bc-86cf-4015-a9ba-b9fbe7ac5fd4" width="45%" />
</p>


A Google Apps Script that automates Elementor form submissions by:

- Copying a preformatted "Client Intake Form" sheet.
- Creating a new sheet tab for each submission.
- Populating mapped fields from submitted data.
- Returning a simple HTML acknowledgment.
- Allowing offline testing with `DUMMY_DATA` and `testWebhook()`.

---

## Features

- Listens for **POST** submissions and **GET** health checks.
- Copies a template sheet for each new form submission.
- Maps form fields to specific cells in the template.
- Always returns HTTP 200 OK responses.
- Includes dummy data and test function for local testing.

---

## Setup Instructions

### 1\. Copy the Script

- Open [Google Apps Script](https://script.google.com/).
- Create a new project.
- Copy and paste the provided code into `Code.gs`.

### 2\. Configure Settings

Update these constants at the top of the script:

```javascript
const SPREADSHEET_ID = 'your-spreadsheet-id-here';
const TEMPLATE_SHEET_NAME = 'Client Intake Form';
const FIELD_MAP = {
  'First Name': 'E5',
  'Last Name': 'L5',
  'Email': 'E11',
  'Telephone': 'E9',
  'Type of Event/Service': 'E13',
  'No. of Guests': 'F17',
  'Glasses Needed': 'L17',
  'Hours of Service': 'L11',
  'Event Date': 'F7',
  'No. of Bartenders': 'F35'
};
```

### 3\. Deploy as Web App

- Go to **Extensions → Apps Script → Deploy → New Deployment → Web App**.
- Set:
  - **Execute as**: Me
  - **Who has access**: Anyone
- Deploy and copy the Web App URL.

### 4\. Connect to Elementor

- Open Elementor form settings.
- Add a Webhook action.
- Paste the Web App URL.

---

## Testing Locally

Run the `testWebhook()` function in Apps Script editor to simulate a form submission.

Example dummy payload:

```javascript
{
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
}
```

---

## File Structure

| File        | Description                        |
|-------------|-------------------------------------|
| `Code.gs`   | Main webhook and sheet management script |
| `README.md` | Project documentation file          |

---

## Notes

- Form field names must exactly match the keys in `FIELD_MAP`.
- Supports both `application/json` and `application/x-www-form-urlencoded` form payloads.
- Sheet names are sanitized to remove invalid characters and truncated if necessary.

---

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit).

---

## Author

Developed by **[Keron Lewis](https://linkedin.com/in/keronlewis)** for **[MixersAnonymous TT](https://mixersanontt.com)** to automate and simplify client intake.

