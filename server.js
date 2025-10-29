import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ===== Backend URLs =====
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "https://your-auth-service.onrender.com";

// ===== Proxy Routes =====
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "/api/auth" }, // keeps path intact
    onProxyReq: (proxyReq, req) => {
      console.log(`[Proxy] ${req.method} ${req.originalUrl} → ${AUTH_SERVICE_URL}${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("[Proxy Error]", err);
      res.status(500).json({ message: "Proxy failed", error: err.message });
    },
  })
);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("✅ Proxy service running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
