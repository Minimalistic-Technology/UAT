import express, { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

import app from "./app";

const PORT = process.env.PORT || 5005;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

app.listen(PORT, () => {
  console.log(`KBC service listening on port ${PORT}`);
});

