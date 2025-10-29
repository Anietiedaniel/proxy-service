import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ===== CORS =====
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stay-next-frontend-production.up.railway.app",
    ],
    credentials: true,
  })
);

// ===== AUTH PROXY =====
// This keeps `/api/auth` fully intact when forwarding.
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE, // e.g. https://stay-next-auth-service.onrender.com
    changeOrigin: true,
    pathRewrite: {
      // ❌ remove the bad rewrite
      // ✅ keep the path untouched
    },
    cookieDomainRewrite: "", // for cookies to work under proxy domain
    onProxyReq: (proxyReq, req) => {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} → ${process.env.AUTH_SERVICE}${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err.message);
      res.status(502).json({ error: "Bad Gateway", details: err.message });
    },
  })
);

// ===== ROOT TEST =====
app.get("/", (req, res) => {
  res.send("✅ StayNext Proxy is live and forwarding requests...");
});

app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`✅ StayNext Proxy Server Running`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔐 AUTH_SERVICE: ${process.env.AUTH_SERVICE}`);
  console.log("=========================================");
});
