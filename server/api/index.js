import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Connect to MongoDB database on serverless function invocation
connectDB();

export default (req, res) => {
  app(req, res);
};
