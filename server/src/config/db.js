import mongoose from 'mongoose';
import logger from './logger.js';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true, // Build indexes automatically in MongoDB
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Bind to error event after connection
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
