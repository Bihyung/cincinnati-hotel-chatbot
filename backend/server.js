import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Load environment variables FIRST
dotenv.config();

// Import routes
import documentRoutes from './routes/document.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

// Import services
import embeddingService from './services/embeddingService.js';
import emailService from './services/emailService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    embeddingReady: embeddingService.isReady(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/document', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected successfully');
  })
  .catch((err) => {
    console.error('[MongoDB] Connection error:', err);
    process.exit(1);
  });

// Initialize services
async function initializeServices() {
  console.log('[Server] Initializing services...');
  
  // Pre-load embedding model
  await embeddingService.initialize();
  
  // Verify email service
  await emailService.verifyConnection();
  
  console.log('[Server] All services initialized');
}

// Start server
app.listen(PORT, async () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize services in background
  initializeServices().catch(err => {
    console.error('[Server] Service initialization failed:', err);
  });
});

export default app;
