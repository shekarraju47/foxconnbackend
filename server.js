// server.js
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// Enable CORS for frontend
app.use(cors());

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

// Upload Excel file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Return success message with the custom file name
  res.json({ message: 'File uploaded successfully', file: req.file });
});

app.get('/file-content', (req, res) => {
  const { fileName } = req.query; // Get file name from query parameters
  const filePath = path.join(__dirname, 'uploads', fileName); // Construct file path

  // Read the Excel file using xlsx
  const workbook = xlsx.readFile(filePath);

  // Get the sheet names
  const sheetNames = workbook.SheetNames;

  // Convert each sheet's data to JSON
  const sheetData = {};
  sheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    sheetData[sheetName] = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON
  });

  res.json({ sheetNames, sheetData }); // Return sheet names and their corresponding data
});

// Delete Excel file
app.delete('/delete', (req, res) => {
  const { filePath } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('File not found.');
  }

  // Delete the file from server
  fs.unlinkSync(filePath);

  res.status(200).send('File deleted successfully.');
});

// Get all uploaded files (list files in the 'uploads' folder)
app.get('/files', (req, res) => {
  const files = fs.readdirSync('uploads/');
  res.json(files);
});

app.get('/download', (req, res) => {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).send('File name is required.');
  }

  const filePath = path.join(__dirname, 'uploads', fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Set headers and send the file
    res.download(filePath, fileName, (err) => {
      if (err) {
        res.status(500).send('Error downloading the file.');
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
});

app.get('/', (req, res) => {
  res.send({
    msg: 'Hello Foxconn'
  })
  console.log("Hello Foxconn");

})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
