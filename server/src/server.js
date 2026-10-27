require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '127.0.0.1';

const startServer = async () => {
  try {
    // Attempt database connection (with automatic fallback to in-memory MongoDB in development)
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn(`[Server Warning] Database connection issue: ${dbErr.message}`);
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`=======================================================`);
      console.log(` SocietyLedger Backend Server Active`);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Server URL  : http://${HOST}:${PORT}`);
      console.log(` Health API  : http://${HOST}:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Server Error] Port ${PORT} is already in use by another service.`);
        console.info(`[Server Recommendation] You can:`);
        console.info(`  1. Close the application currently occupying port ${PORT}.`);
        console.info(`  2. Or change the PORT in server/.env (e.g., PORT=5001) and update VITE_API_BASE_URL in frontend/.env accordingly.\n`);
      } else {
        console.error(`[Server Fatal Error] ${err.message}`);
      }
      process.exit(1);
    });

    const gracefulShutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error(`[Server Fatal Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
