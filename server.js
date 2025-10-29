import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ===== CORS setup =====
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stay-next-frontend-production.up.railway.app",
    ],
    credentials: true,
  })
);

// ===== AUTH SERVICE PROXY =====
// Frontend calls:  https://proxy-service-0s6s.onrender.com/api/auth/login
// Backend target:  https://stay-next-auth-service.onrender.com/api/auth/login
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE, // e.g. https://stay-next-auth-service.onrender.com
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "/api/auth", // ✅ keep path identical
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} → ${process.env.AUTH_SERVICE}${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err.message);
      res.status(502).json({ error: "Bad Gateway", details: err.message });
    },
  })
);

// ===== Root route =====
app.get("/", (req, res) => {
  res.send("✅ StayNext Proxy is live and forwarding requests...");
});

app.listen(PORT, () => console.log(`✅ Proxy running on port ${PORT}`));
