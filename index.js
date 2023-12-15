// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const csvtojson = require('csvtojson');
// const xlsx = require('xlsx'); // Add xlsx library for XLSX to CSV conversion
// const Candidate = require('./studentSchema');

// const app = express();
// const DB_USER = 'princedubey685';
// const DB_PASSWORD = '4Bk5uTjgpXzGvZFg';
// const MONGODB_URI = 'mongodb+srv://princedubey685:4Bk5uTjgpXzGvZFg@cluster0.qtpa2fm.mongodb.net/?retryWrites=true&w=majority';
// const PORT = process.env.PORT || 5000;

// mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Database connected');
//         app.listen(PORT, () => {
//             console.log(`Server started at port ${PORT}`);
//         });
//     })
//     .catch((error) => {
//         console.error('Error connecting to the database:', error);
//     });

// app.use(express.static('public'));
// app.set('view engine', 'ejs');

// const excelStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/excelUploads');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });

// const excelUploads = multer({ storage: excelStorage });

// app.get('/', async (req, res) => {
//     try {
//         const candidates = await Candidate.find();
//         console.log('Candidates:', candidates);
//         res.render('index.ejs', { candidates });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.post('/uploadExcelFile', excelUploads.single('uploadfile'), async (req, res) => {
//     const filePath = './public/excelUploads/' + req.file.filename;
//     console.log('File Uploaded:', filePath);

//     try {
        // Check file extension to determine conversion type
//         const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

//         if (fileExtension === 'xlsx') {
            // Convert XLSX to CSV
//             const csvFilePath = filePath.replace('.xlsx', '.csv');
//             convertXlsxToCsv(filePath, csvFilePath);
//             console.log('XLSX converted to CSV:', csvFilePath);

            // Read CSV File to JSON Data
//             const source = await csvtojson().fromFile(csvFilePath);

            // Insert data into the 'candidates' collection
//             const arrayToInsert = source.map(row => ({
//                 name: row['Name of the Candidate'],
//                 email: row['Email'],
//                 mobileNo: row['Mobile No.'],
//                 dateOfBirth: row['Date of Birth'],
//                 workExperience: row['Work Experience'],
//                 resumeTitle: row['Resume Title'],
//                 currentLocation: row['Current Location'],
//                 postalAddress: row['Postal Address'],
//                 currentEmployer: row['Current Employer'],
//                 currentDesignation: row['Current Designation'],
//             }));

//             await Candidate.insertMany(arrayToInsert);
//             console.log('File imported successfully.');
//             res.redirect('/');
//         } else {
            // Handle other file types or show an error
//             console.log('Unsupported file type.');
//             res.status(400).send('Unsupported file type. Please upload an XLSX file.');
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });

// Function to convert XLSX to CSV
// function convertXlsxToCsv(xlsxFilePath, csvFilePath) {
//     try {
//         const workbook = xlsx.readFile(xlsxFilePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const csvData = xlsx.utils.sheet_to_csv(sheet);
//         fs.writeFileSync(csvFilePath, csvData, 'utf-8');
//     } catch (error) {
//         console.error('Error converting XLSX to CSV:', error);
//     }
// }


const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const csvtojson = require('csvtojson');
const xlsx = require('xlsx'); // Add xlsx library for XLSX to CSV conversion
const fs = require('fs'); // Add this line
const Candidate = require('./studentSchema');

const app = express();
const DB_USER = 'princedubey685';
const DB_PASSWORD = '4Bk5uTjgpXzGvZFg';
const MONGODB_URI = 'mongodb+srv://princedubey685:4Bk5uTjgpXzGvZFg@cluster0.qtpa2fm.mongodb.net/?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
    });

app.use(express.static('public'));
app.set('view engine', 'ejs');

const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/excelUploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const excelUploads = multer({ storage: excelStorage });

app.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        console.log('Candidates:', candidates);
        res.render('index.ejs', { candidates });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/uploadExcelFile', excelUploads.single('uploadfile'), async (req, res) => {
    const filePath = './public/excelUploads/' + req.file.filename;
    console.log('File Uploaded:', filePath);

    try {
        // Check file extension to determine conversion type
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx') {
            // Convert XLSX to CSV
            const csvFilePath = filePath.replace('.xlsx', '.csv');
            convertXlsxToCsv(filePath, csvFilePath);
            console.log('XLSX converted to CSV:', csvFilePath);

            // Read CSV File to JSON Data
            const source = await csvtojson().fromFile(csvFilePath);

            // Insert data into the 'candidates' collection
            const arrayToInsert = source.map(row => ({
                name: row['Name of the Candidate'],
                email: row['Email'],
                mobileNo: row['Mobile No.'],
                dateOfBirth: row['Date of Birth'],
                workExperience: row['Work Experience'],
                resumeTitle: row['Resume Title'],
                currentLocation: row['Current Location'],
                postalAddress: row['Postal Address'],
                currentEmployer: row['Current Employer'],
                currentDesignation: row['Current Designation'],
            }));
            console.log(arrayToInsert);

            await Candidate.insertMany(arrayToInsert);
            console.log('File imported successfully.');
            res.redirect('/');
        } else {
            // Handle other file types or show an error
            console.log('Unsupported file type.');
            res.status(400).send('Unsupported file type. Please upload an XLSX file.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Function to convert XLSX to CSV
function convertXlsxToCsv(xlsxFilePath, csvFilePath) {
    try {
        const workbook = xlsx.readFile(xlsxFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const csvData = xlsx.utils.sheet_to_csv(sheet);
        fs.writeFileSync(csvFilePath, csvData, 'utf-8');
    } catch (error) {
        console.error('Error converting XLSX to CSV:', error);
    }
}
