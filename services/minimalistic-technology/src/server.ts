import app from "./app";
import connectDB from "./utils/db";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI ||  "";

const PORT = process.env.PORT || 5002;


connectDB(MONGO_URI);

app.listen(PORT, () => {
  console.log(`Minimalistic Technology service listening on port ${PORT}`);
});
