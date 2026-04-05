import mongoose from "mongoose";

export const isMongoId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const isValidParams = (params: string[] | string) => {
  if (Array.isArray(params)) {
    params = params[0];
  }

  if (!params || typeof params !== "string" || params.trim() === "") {
    return null;
  }

  if (!isMongoId(params)) {
    return null;
  }

  return params;
};
