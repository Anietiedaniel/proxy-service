// server.js
import express from "express";
import cors from "cors";
// import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const app = express();

// ========== ENV VARIABLES ==========
const PORT = process.env.PORT || 8080;
const FRONTEND_ORIGIN = "https://stay-next-frontend-production.up.railway.app";
const AUTH_SERVICE = "https://stay-next-auth-service-4.onrender.com"; // your auth service URL

// ========== MIDDLEWARE ==========
// app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// ========== PROXY SETUP ==========
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
    credentials: true,
    pathRewrite: { "^/api/auth": "/api/auth" },
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// ========== HEALTH CHECK ==========
app.get("/", (req, res) => {
  res.send("✅ StayNext Proxy Server Running");
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`✅ StayNext Proxy Server Running`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔐 AUTH_SERVICE: ${AUTH_SERVICE}`);
  console.log("=========================================");
});
