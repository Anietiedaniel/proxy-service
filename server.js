import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stay-next-frontend-production.up.railway.app",
    ],
    credentials: true,
  })
);

// 🔍 Log every request
app.use((req, res, next) => {
  console.log(
    `➡️  [${req.method}] ${req.originalUrl}\n   Headers:`,
    JSON.stringify(req.headers, null, 2)
  );
  next();
});

// =============================================
// 🔹 AUTH SERVICE PROXY
// =============================================
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "/api/auth" },
    cookieDomainRewrite: "",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🚀 Forwarding [${req.method}] → AUTH_SERVICE: ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("❌ AUTH proxy error:", err);
    },
  })
);

// =============================================
// 🔹 AGENT SERVICE PROXY
// =============================================
app.use(
  "/api/agents",
  createProxyMiddleware({
    target: process.env.AGENT_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/agents": "/api/agents" },
    cookieDomainRewrite: "",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🚀 Forwarding [${req.method}] → AGENT_SERVICE: ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("❌ AGENT proxy error:", err);
    },
  })
);

// =============================================
// ✅ Test Route
// =============================================
app.get("/", (req, res) => {
  res.send("🟢 StayNext Proxy is active and forwarding requests...");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("=========================================");
  console.log("✅ StayNext Proxy Server Running");
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔐 AUTH_SERVICE: ${process.env.AUTH_SERVICE}`);
  console.log(`🧠 AGENT_SERVICE: ${process.env.AGENT_SERVICE}`);
  console.log("=========================================");
});
