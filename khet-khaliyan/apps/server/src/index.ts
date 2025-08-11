import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/khet-khaliyan';
const PORT = process.env.PORT || 4000;

async function start() {
  await mongoose.connect(MONGO_URI);

  app.get('/health', (_req, res) => res.json({ status: 'ok', id: uuidv4() }));

  // Schedule cron at 6:00, 12:00, 18:00 local time
  cron.schedule('0 6,12,18 * * *', async () => {
    console.log('Cron: refresh mandi prices');
  });

  app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});