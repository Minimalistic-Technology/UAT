import { config } from "../config/env.js";
import jwt from "jsonwebtoken";

export const generateToken = (id: string): string => {
  const jwtOptions = {
    expiresIn: (config.jwtExpire || "7d") as any,
  };
  return jwt.sign({ id }, config.jwtSecret as string, jwtOptions);
};
