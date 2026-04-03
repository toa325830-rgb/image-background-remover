const { google } = require('googleapis');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('/root/.openclaw/workspace/credentials/google-service-account.json'));

async function setup() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Enable Sheets API by calling it
  console.log('Setting up Google Sheets...');

  // Create a new spreadsheet
  const createRes = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title: 'Image BG Remover - User Credits',
      },
      sheets: [
        {
          properties: {
            title: 'Users',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'UsageLogs',
          },
        },
      ],
    },
    fields: 'spreadsheetId',
  });

  const spreadsheetId = createRes.data.spreadsheetId;
  console.log('Created spreadsheet:', spreadsheetId);

  // Set headers for Users sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Users!A1:H1',
    valueInputOption: 'RAW',
    resource: {
      values: [['User ID', 'Name', 'Email', 'Picture', 'Free Credits Used', 'Has Subscription', 'Subscription Plan', 'Created At']],
    },
  });

  // Set up UsageLogs headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'UsageLogs!A1:E1',
    valueInputOption: 'RAW',
    resource: {
      values: [['Timestamp', 'User ID', 'Action', 'Credits Before', 'Credits After']],
    },
  });

  console.log('Sheets configured successfully!');
  console.log('Spreadsheet ID:', spreadsheetId);
  console.log('Share this sheet with:', credentials.client_email);
  
  // Make the sheet publicly readable/writable by anyone with the link
  // (for simple use case without domain restriction)
  await drive.permissions.create({
    fileId: spreadsheetId,
    resource: {
      type: 'user',
      role: 'writer',
      emailAddress: credentials.client_email,
    },
  });

  console.log('Service account added as editor');
  return spreadsheetId;
}

setup().catch(console.error);
