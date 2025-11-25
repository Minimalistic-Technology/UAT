const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Minimalistic Learning Service Running");
});

app.listen(3002, () => console.log("Minimalistic Learning service on port 3002"));
