import app from "./app";

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Minimalistic Technology service listening on port ${PORT}`);
});