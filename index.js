const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const csvtojson = require('csvtojson');
const xlsx = require('xlsx');
const fs = require('fs'); 
const Candidate = require('./studentSchema');

const app = express();
const MONGODB_URI = 'mongodb+srv://khaprasanyam:gw6Ow1Y42z2v2Z7x@cluster0.woslhdu.mongodb.net/?retryWrites=true&w=majority';
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
        const successMessage = req.query.success;
        const errorMessage = req.query.error;
        console.log('Candidates:', candidates);
        res.render('index.ejs', { candidates, successMessage, errorMessage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/uploadExcelFile', excelUploads.single('uploadfile'), async (req, res) => {
    const filePath = './public/excelUploads/' + req.file.filename;
    console.log('File Uploaded:', filePath);

    try {
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        if (fileExtension === 'xlsx') {
            const csvFilePath = filePath.replace('.xlsx', '.csv');
            convertXlsxToCsv(filePath, csvFilePath);
            console.log('XLSX converted to CSV:', csvFilePath);
            const source = await csvtojson().fromFile(csvFilePath);
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
            
            // Reflect success message upon successful import
            res.redirect('/?success=File imported successfully.');
        } else {
            console.log('Unsupported file type.');
            // Reflect failure message for unsupported file type
            res.redirect('/?error=Unsupported file type. Please upload an XLSX file.');
        }
    } catch (err) {
        console.error(err);
        // Reflect failure message for internal server error
        res.redirect('/?error=Internal Server Error');
    }
});
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
