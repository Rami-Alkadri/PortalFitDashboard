import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes will be added here
app.get('/api/data', (req, res) => {
  res.json({ message: 'Basketball Dashboard API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
}); 