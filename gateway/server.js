// gateway.js (for Docker)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env') 
});

app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

// HRM Service
app.use(
  '/hrm',
  createProxyMiddleware({
    target: 'http://minimalistic-hrm:5001',
    changeOrigin: true,
    pathRewrite: { '^/hrm': '' }, // /hrm/employees -> /employees
  })
);

app.use(
  '/learning',
  createProxyMiddleware({
    target: 'http://minimalistic-learning:5002',
    changeOrigin: true,
    pathRewrite: { '^/learning': '' }, // /learning/courses -> /courses
  })
);


app.listen(process.env.PORT || 5000, () => {
  console.log("API Gateway running on port " + process.env.PORT || 5000);
});
