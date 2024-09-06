const express = require('express');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Google Sheets setup (replace the placeholder with your sheet ID)
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
