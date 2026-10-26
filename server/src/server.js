require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Attempt database connection
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn(`[Server Notice] Starting web server without active MongoDB connection: ${dbErr.message}`);
    }

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` SocietyLedger Backend Server Active`);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Server Port : ${PORT}`);
      console.log(` Health API  : http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
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
