import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.json';
import { connectDB } from './config/db';
import { initializeSocket } from './services/socketService';
import authRoutes from './routes/authRoutes';
import driverRoutes from './routes/driverRoutes';
import rideRoutes from './routes/rideRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB Database
connectDB();

// CORS configuration
app.use(cors());

// Body Parser
app.use(express.json());

// Serve Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize WebSockets
initializeSocket(server);

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: "E-Ricks Backend",
    status: "Running",
    documentation: "http://localhost:5000/api/docs",
    health: "http://localhost:5000/health"
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  const dbConnected = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    success: true,
    server: "running",
    database: dbConnected,
    uptime: uptimeString,
    version: "1.0.0"
  });
});

// Fallback Route for Undefined Paths
app.use((req, res, next) => {
  const err: any = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] E-Ricks Backend Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
