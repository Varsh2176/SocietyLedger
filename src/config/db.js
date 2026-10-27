const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/society_ledger';

/**
 * Connect to MongoDB with robust error handling and configuration
 * @param {string} [customUri] Optional connection URI override
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB connection failure to ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}: ${error.message}`);
    throw error;
  }
}

/**
 * Safely disconnect from MongoDB
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

/**
 * Check the current MongoDB connection health
 * @returns {{ isConnected: boolean, readyState: number, host: string|null, name: string|null }}
 */
function checkDBHealth() {
  const state = mongoose.connection.readyState;
  return {
    isConnected: state === 1,
    readyState: state,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
}

module.exports = {
  connectDB,
  disconnectDB,
  checkDBHealth,
  DEFAULT_URI
};
