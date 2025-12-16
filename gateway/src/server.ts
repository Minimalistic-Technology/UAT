// gateway.js (for Docker)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env') 
});

app.get('/health', (req:any, res:any) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

const DDTEC_URL = process.env.DDTEC_URL || "http://ddtec:5004";
const HRM_URL = process.env.HRM_URL || "http://minimalistic-hrm:5002";
const LEARNING_URL = process.env.LEARNING_URL || "http://minimalistic-learning:5001";
// const MT_URL = process.env.MT_URL || "http://minimalistic-technology:5003";

app.use(
  '/hrm',
  createProxyMiddleware({
    target: HRM_URL,
    changeOrigin: true,
    pathRewrite: { '^/hrm': '' },
  })
);

app.use(
  '/learning',
  createProxyMiddleware({
    target: LEARNING_URL,
    changeOrigin: true,
    pathRewrite: { '^/learning': '' },
  })
);

// app.use(
//   '/mt',
//   createProxyMiddleware({
//     target: MT_URL,
//     changeOrigin: true,
//     pathRewrite: { '^/mt': '' },
//   })
// );

app.use(
  '/ddtec',
  createProxyMiddleware({
    target: DDTEC_URL,
    changeOrigin: true,
    pathRewrite: { '^/ddtec': '' },
  })
);


app.listen(process.env.PORT || 5000, () => {
  console.log("API Gateway running on port " + (process.env.PORT || 5000));
});
