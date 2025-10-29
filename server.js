import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ===== Middleware =====
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://stay-next-frontend-production.up.railway.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ===== Proxy setup =====
// This version *preserves* "/api/auth" fully.
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE, // your backend base URL
    changeOrigin: true,
    secure: false,
    // DO NOT strip /api/auth from path
    pathRewrite: (path) => path, // keep it as-is
    cookieDomainRewrite: "", // allow cookies from backend to match proxy domain
    logLevel: "debug", // helps you see what’s going on in logs
    onProxyReq(proxyReq, req) {
      console.log(`➡️ Forwarding: ${req.method} ${req.originalUrl}`);
    },
    onError(err, req, res) {
      console.error("❌ Proxy Error:", err.message);
      res.status(502).json({ message: "Proxy Error", details: err.message });
    },
  })
);

// ===== Health route =====
app.get("/", (req, res) => {
  res.send("✅ Proxy is running and configured correctly!");
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server live on port ${PORT}`);
  console.log(`🔗 Target: ${process.env.AUTH_SERVICE}`);
});
