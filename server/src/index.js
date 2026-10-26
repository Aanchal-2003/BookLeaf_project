import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`[SERVER] BookLeaf Portal API running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`[SERVER] Health check: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[SERVER] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('[FATAL] Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();
