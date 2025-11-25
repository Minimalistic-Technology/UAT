const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("HRM Service Running");
});

app.listen(8001, () => console.log("HRM service on port 8001"));
