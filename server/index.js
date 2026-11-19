import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import screeningRoutes from './routes/screeningRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import patientRoutes from './routes/patientRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : false);

// Middleware
app.use(cors({ origin: allowedOrigin }));
app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'OncoLink Clinical Backend API',
    database: getDBStatus(),
    minimothGateway: 'Configured',
    mlEngine: 'PyTorch 2.10 + OpenCV 4.13 Saliency Engine'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/patients', patientRoutes);

// Connect Database and Start Server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  ONCOLINK CLINICAL BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Minimoth SMS Gateway: ${process.env.MINIMOTH_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    console.log(`  Vision Provider: ${process.env.GEMINI_API_KEY ? 'Gemini' : 'Local development only'}`);
    console.log(`=================================================`);
  });
  server.on('error', (error) => {
    console.error(`[Startup] Could not bind port ${PORT}: ${error.message}`);
    process.exitCode = 1;
  });
}).catch((error) => {
  console.error(`[Startup] ${error.message}`);
  process.exit(1);
});
