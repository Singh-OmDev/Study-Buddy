import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('AI Study Buddy API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/ai', aiRoutes);

export default app;
