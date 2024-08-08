const express = require('express');
const router = express.Router();
const multer = require('multer');
const { transcribeAudio, getChatCompletion} = require('../utils/audio');


let transcriptions = [];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });


router.post('/', upload.single('wavfile'), async (req, res) => {
    console.log('File received:', req.file);
    const { contactId, dateTime } = req.body;

    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const transcript = await transcribeAudio(req.file.path);
        console.log('Transcription:', transcript);

        const chatResponse = await getChatCompletion(transcript);
        console.log('Claude Sonnet Response:', chatResponse);

    

        const recordingUrl = `http://localhost:8080/uploads/${req.file.filename}`;
        console.log('Recording URL:', recordingUrl);

        const transcription = { id: Date.now(), transcript, filePath: req.file.filename, contactId, dateTime, recordingUrl };
        transcriptions.push(transcription);


        res.status(200).send({ message: 'File received, transcribed, and responded successfully', transcript, chatResponse, mp3Url, recordingUrl });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send({ error: 'Error', details: error.response ? error.response.data : error.message });
    }
});

module.exports = router;