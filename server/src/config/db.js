const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/societyledger';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2500, // Quick timeout if external MongoDB is not running
    });
    console.log(`[Database] MongoDB connected successfully to ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] External MongoDB connection at ${uri} was unavailable (${error.message}).`);

    // In non-production environments, gracefully fall back to in-memory MongoDB
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Database] Starting built-in in-memory MongoDB server (mongodb-memory-server)...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memUri, { autoIndex: true });
        console.log(`[Database] Successfully connected to in-memory MongoDB at ${memUri}`);

        // Automatically seed in-memory database if empty
        const { Society } = require('../models');
        const societyCount = await Society.countDocuments();
        if (societyCount === 0) {
          console.log('[Database] Seeding initial dataset into in-memory database...');
          const seedDatabase = require('../seed');
          // seedDatabase handles seeding; pass true to prevent disconnecting
          await seedDatabase();
        }

        return conn;
      } catch (memErr) {
        console.error(`[Database Error] Failed to start in-memory MongoDB fallback: ${memErr.message}`);
        throw error;
      }
    }

    throw error;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (error) {
    console.error(`[Database Error] Disconnect error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
