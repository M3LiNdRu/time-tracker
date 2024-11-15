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

app.get('/api/summaries/daily', async (req, res) => {
  try {
    const estimated = 8;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const from = new Date(currentYear, currentMonth, 1);
    const to = new Date(currentYear, currentMonth, 1);
    to.setMonth(from.getMonth() + 1);

    const timestamps = await Timestamp
      .find({/* timestamp: { $gte: from, $lt: to} */})
      .sort({ timestamp: 1})
      .exec();

    const groups = Object.groupBy(timestamps, element => {
        const date = new Date(element.timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()}`;
    })

    const entries = {};
    Object.entries(groups).forEach(([date, values]) => {
        const current = values
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .reduce((acc, _, index, array) => {
            if (index % 2 === 0 && index + 1 < array.length) {
              const previous = new Date(array[index].timestamp);
              const current = new Date(array[index + 1].timestamp);
              const differenceMs = current - previous;
              acc += differenceMs / (1000 * 60 * 60); 
            }
            return acc;
          }, 0);
        
        entries[date] = {
          in: new Date(Math.min(...values.filter(e => e.type === "in").map(date => new Date(date.timestamp)))),
          out: new Date(Math.max(...values.filter(e => e.type === "out").map(date => new Date(date.timestamp)))),
          estimated: estimated,
          current: current,
          overtime: current - estimated
        };
    });

    res.json(entries);
  }
  catch (error) {
    console.error('Error en obtenir les dades:', error);
    res.sendStatus(500);
  }
});

app.listen(3000);