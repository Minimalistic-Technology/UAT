// gateway.js (for Docker)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env') 
});

// HRM Service
app.use(
  "/hrm",
  createProxyMiddleware({
    target: `http://${process.env.HRM_INTERNAL}`,
    changeOrigin: true,
    pathRewrite: { "^/hrm": "" }
  })
);

// User Service
app.use(
  "/learning",
  createProxyMiddleware({
    target: `http://${process.env.LEARNING_INTERNAL}`,
    changeOrigin: true,
    pathRewrite: { "^/learning": "" }
  })
);

app.listen(process.env.PORT, () => {
  console.log("API Gateway running on port " + process.env.PORT);
});
