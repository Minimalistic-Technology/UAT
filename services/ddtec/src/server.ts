import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 5004;

app.get("/", (req: Request, res: Response) => {
  res.send("DDTEC main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "ddtec" });
});

app.listen(PORT, () => {
  console.log(`DDTEC service listening on port ${PORT}`);
});
