import express, { Request, Response } from "express";
import cluster from "node:cluster";
import os from "node:os";
import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";

const PORT = env.PORT || 5001;

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Learning Backend API");
});

const startServer = async () => {
  try {
    await connectDatabase(); // PostgreSQL (Prisma) connection
    app.listen(PORT, () => {
      console.log(
        `[server] Service listening on port ${PORT} in ${env.NODE_ENV} mode`,
      );
      console.log(`[server] CORS origins: ${env.corsOrigins.join(", ")}`);
    });
  } catch (err) {
    console.error("Failed to start server because of DB connection:", err);
    process.exit(1);
  }
};

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(
    `[server] Primary ${process.pid} is running. Forking for ${numCPUs} CPUs.`,
  );

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(`[server] Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  startServer();
}
