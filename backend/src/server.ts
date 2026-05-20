import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DDTEC service listening on port http://localhost:${PORT}`);
});
