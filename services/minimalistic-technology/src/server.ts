import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 5003;

app.get("/", (req: Request, res: Response) => {
  res.send("Minimalistic Technology main site");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "minimalistic-technology" });
});

app.listen(PORT, () => {
  console.log(`Minimalistic Technology service listening on port ${PORT}`);
});
