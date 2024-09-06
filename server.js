const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // <-- Add this line for serving static files
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public'))); // <-- Add this line to serve static files

// Google Sheets setup
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

app.post('/vote', async (req, res) => {
    const { code, project } = req.body;

    try {
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // First sheet
        const rows = await sheet.getRows();
        const voter = rows.find(row => row.code === code);

        if (!voter) {
            return res.status(400).json({ success: false, message: 'Invalid code' });
        }

        if (voter.voted === 'yes') {
            return res.status(400).json({ success: false, message: 'Code already used' });
        }

        voter.project = project;
        voter.voted = 'yes';
        await voter.save();

        res.json({ success: true, message: 'Vote recorded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // <-- This will serve index.html for any route
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
