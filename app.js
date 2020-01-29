const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer')

const path = require('path');
const {createWorker} = require('tesseract.js')


// Storage
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage}).single('avatar')

app.set('view engine', 'ejs')

// Routes
app.get('/', (req,res) => {
    res.render('index')
})

app.post('/upload', (req,res) => {
    upload(req,res, err => {
        console.log(req.file)
        const path = `./uploads/${req.file.originalname}`
        fs.readFile(path, (err, data) => {
            if(err) return console.log("Error Occured")
            
            const image = path

            console.log(`Recognizing ${req.file.originalname}`);

            (async () => {
            const worker = createWorker({
                error: err => console.error(err)
                })
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(image);
            console.log(text)
            res.send(text)
            const { data } = await worker.getPDF('Tesseract OCR Result');
            fs.writeFileSync('tesseract-ocr-result.pdf', Buffer.from(data));
            console.log('Generate PDF: tesseract-ocr-result.pdf');
            await worker.terminate();
            })();
        })
    })
})


// Start up server
const PORT = 5000 || process.env.PORT
app.listen(PORT, () => console.log(`Hey I'm running on port ${PORT}`))