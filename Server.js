require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


const transcriptionRoutes = require('./Routes/transcription');


app.use('/api', transcriptionRoutes);

const promptRoutes = require('./Routes/promptRoutes');
app.use('/apii', promptRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});