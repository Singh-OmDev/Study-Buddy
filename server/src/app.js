import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';


import studyRoutes from './routes/studyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send('AI Study Buddy API is running...');
});


app.use('/api/study', studyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/match', matchRoutes);

export default app;
