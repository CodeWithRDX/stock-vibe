import 'dotenv/config'; // loads env variables
import app from './app.js';
import { connectDB } from './config/db.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to Database
  await connectDB();

  // 2. Start HTTP Server
  const server = app.listen(PORT, () => {
    logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
};

startServer();
