const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const csvFilePath = './codes.csv';
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        {id: 'code', title: 'code'},
        {id: 'used', title: 'used'}
    ]
});

// Function to read CSV and return data
function readCodesFromCSV() {
    return new Promise((resolve, reject) => {
        const codes = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => codes.push(row))
            .on('end', () => resolve(codes))
            .on('error', (error) => reject(error));
    });
}

// POST route to handle voting
app.post('/vote', async (req, res) => {
    const { code, project } = req.body;

    try {
        const codes = await readCodesFromCSV();
        const codeEntry = codes.find(c => c.code === code && c.used === 'false');

        if (!codeEntry) {
            return res.status(400).json({ success: false, message: 'Invalid or already used code' });
        }

        // Mark code as used
        codeEntry.used = 'true';
        await csvWriter.writeRecords(codes);

        // Now record the vote in Google Sheets (you can leave this part as is)
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
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
