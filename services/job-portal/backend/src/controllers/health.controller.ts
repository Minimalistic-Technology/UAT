import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { prisma } from "../lib/prisma.js";
import redisClient from "../config/redis.js";

const checkDatabase = async () => {
  const start = process.hrtime.bigint();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    return { status: "operational", latencyMs: Math.round(latencyMs * 100) / 100 };
  } catch (error) {
    return {
      status: "disconnected",
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

const checkRedis = async () => {
  if (!redisClient.isOpen) {
    return { status: "disconnected" };
  }

  const start = process.hrtime.bigint();
  try {
    await redisClient.ping();
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    return { status: "operational", latencyMs: Math.round(latencyMs * 100) / 100 };
  } catch (error) {
    return {
      status: "disconnected",
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

export const getHealth = async (req: Request, res: Response) => {
  const [database, cache] = await Promise.all([checkDatabase(), checkRedis()]);

  const isHealthy = database.status === "operational";
  const status = isHealthy ? "operational" : "degraded";

  res.status(isHealthy ? 200 : 503).json(
    new ApiResponse(
      isHealthy ? 200 : 503,
      {
        server: "operational",
        database,
        cache,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      `System is ${status}`,
    ),
  );
};
