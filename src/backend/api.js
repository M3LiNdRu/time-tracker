import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const dbURI = 'mongodb://root:example@mongo:27017/timetracker?authSource=admin'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexió amb MongoDB establerta'))
  .catch((error) => console.error('Error de connexió a MongoDB:', error));

const schema = new mongoose.Schema({
  timestamp: String,
  type: String
});
const Timestamp = mongoose.model('timestamps', schema);

const app = express();

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'OPTIONS']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ info: 'Time Tracker Api'})
})

app.post('/api/timestamp', async (req, res) => {
  try {
    const newItem = new Timestamp({
      timestamp: req.body.timestamp,
      type: req.body.type
    });
    await newItem.save();
    res.sendStatus(201);
  } 
  catch (error) {
    console.error('Error en desar les dades:', error);
    res.sendStatus(500);
  }
});

app.listen(3000);