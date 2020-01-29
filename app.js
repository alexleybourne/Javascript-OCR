const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer')

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
            console.log(`Recognizing ${req.file.originalname}`)

            // // Removes original Images .png, .jpeg etc.
            // let saveName = req.file.originalname.toString()
            // saveName = (saveName.split('.')[0])

            // For some reason it has to be like this or it crashes??
            OCR()
            
            // The MAGIC
            function OCR()  {
            (async () => {
            const worker = createWorker({
                error: err => console.error(err)
                })
            await worker.load()
            await worker.loadLanguage('eng')
            await worker.initialize('eng')
            const { data: { text } } = await worker.recognize(image)
            console.log(text)
            const { data } = await worker.getPDF('Tesseract OCR Result')

            fs.writeFileSync(`ReadBot.pdf`, Buffer.from(data))
            console.log(`Generate PDF: ReadBot.pdf`)

            res.redirect('/download')

            await worker.terminate()
            })()}
        })
    })
})

app.get('/download', (req, res) => {
    const file = `${__dirname}/ReadBot.pdf`
    res.download(file)
})


// Start up server
const PORT = 5000 || process.env.PORT
app.listen(PORT, () => console.log(`Hey I'm running on port ${PORT}`))