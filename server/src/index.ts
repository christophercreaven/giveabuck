import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { scholarshipsRouter } from './routes/scholarships';
import { donationsRouter } from './routes/donations';
import { applicationsRouter } from './routes/applications';
import { usersRouter } from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/scholarships', scholarshipsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`GiveABuck API running on http://localhost:${PORT}`);
});
