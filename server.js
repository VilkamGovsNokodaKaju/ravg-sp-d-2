const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');  // For reading and writing to codes.json
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const codesFilePath = './codes.json';  // Path to codes.json

app.use(bodyParser.json());

// Function to read the verification codes from codes.json
function readCodes() {
  return JSON.parse(fs.readFileSync(codesFilePath, 'utf8'));
}

// Function to write updated codes back to codes.json
function writeCodes(codes) {
  fs.writeFileSync(codesFilePath, JSON.stringify(codes, null, 2), 'utf8');
}

app.post('/vote', async (req, res) => {
    const { code, project } = req.body;
    const codesData = readCodes();
    const codeEntry = codesData.codes.find(c => c.code === code && !c.used);

    if (!codeEntry) {
        return res.status(400).json({ success: false, message: 'Invalid or already used code' });
    }

    codeEntry.used = true;
    writeCodes(codesData);

    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        await sheet.addRow({ Code: code, Project: project });

        res.json({ success: true, message: 'Vote recorded successfully!' });
    } catch (error) {
        console.error('Failed to record vote:', error); // Log detailed error
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});




// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Fallback route to serve index.html for any non-API route
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
