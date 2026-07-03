import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`DDTEC service listening on port http://localhost:${PORT}`);
});

// Graceful shutdown to completely prevent EADDRINUSE Port Zombies during Nodemon hot-reloads
const gracefulShutdown = () => {
  console.log("\n[SYSTEM] Terminating Backend Server Gracefully...");
  server.close(async () => {
    console.log("[SYSTEM] HTTP server TCP socket closed.");
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("[SYSTEM] Mongoose default connection cleanly disconnected.");
    }
    process.exit(0);
  });

  // Force close after 5 seconds if lingering connections exist
  setTimeout(() => {
    console.error("[SYSTEM] Could not close connections in time, forcefully exiting...");
    process.exit(1);
  }, 5000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown); // Catch nodemon restarts
// touch