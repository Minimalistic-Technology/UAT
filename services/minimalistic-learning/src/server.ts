import express, { Request, Response } from "express";
import app from "./app";

const PORT = process.env.PORT || 5001;

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Learning main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-learning" });
});

app.listen(PORT, () => {
  console.log(`Minimalistic Learning service listening on port ${PORT}`);
});
