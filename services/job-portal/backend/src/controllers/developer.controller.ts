import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const getCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Fetch only base tables (exclude views) in the public schema
    // and ignore internal Prisma migration tables, ordered alphabetically.
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
              AND table_name != '_prisma_migrations'
            ORDER BY table_name ASC;
        `;

    if (!tables || tables.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No tables found"));
    }

    const modelNames = tables.map((t) => t.table_name);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          modelNames,
          "All collections fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const runQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { collectionName, operation, query, updateData } = req.body;

    // Note: The frontend previously sent Mongoose JSON queries.
    // Prisma's generated models use a completely different JSON format.
    // We will expose raw SQL capability here instead.

    const sendSafeJson = (data: any) => {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .send(
          JSON.stringify(data, (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
        );
    };

    if (
      query &&
      typeof query === "string" &&
      query.trim().toUpperCase().startsWith("SELECT")
    ) {
      const result = await prisma.$queryRawUnsafe(query);
      return sendSafeJson(
        new ApiResponse(200, result, "Database Query executed successfully"),
      );
    } else if (query && typeof query === "string") {
      const result = await prisma.$executeRawUnsafe(query);
      return sendSafeJson(
        new ApiResponse(200, result, "Database Query executed successfully"),
      );
    }

    // Fallback for Prisma's dynamic method calling (requires frontend to send valid Prisma json)
    if (!collectionName || !(prisma as any)[collectionName]) {
      throw new ApiError(400, `Model '${collectionName}' not found in Prisma.`);
    }

    const Model = (prisma as any)[collectionName];
    let result;

    const parseJsonSafely = (data: any) => {
      if (!data) return {};
      if (typeof data === "object") return data;
      try {
        return JSON.parse(data);
      } catch (e) {
        throw new ApiError(400, "Invalid JSON format in query or data");
      }
    };

    const parsedQuery = parseJsonSafely(query);
    const parsedUpdateData = parseJsonSafely(updateData);

    switch (operation) {
      case "find":
        result = await Model.findMany({ where: parsedQuery, take: 500 });
        break;
      case "findOne":
        result = await Model.findFirst({ where: parsedQuery });
        break;
      case "updateOne":
        result = await Model.update({
          where: parsedQuery,
          data: parsedUpdateData,
        });
        break;
      case "updateMany":
        result = await Model.updateMany({
          where: parsedQuery,
          data: parsedUpdateData,
        });
        break;
      case "deleteMany":
        result = await Model.deleteMany({ where: parsedQuery });
        break;
      case "deleteOne":
        result = await Model.delete({ where: parsedQuery });
        break;
      case "create":
        result = await Model.create({ data: parsedUpdateData });
        break;
      default:
        throw new ApiError(400, "Invalid Database Operation Provided");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Database Query executed successfully"),
      );
  } catch (error) {
    next(error);
  }
};
