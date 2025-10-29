import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// ===============================
// 🧩 Basic Middleware
// ===============================
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

// ===============================
// 🧾 Request Logger (for all routes)
// ===============================
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`\n➡️  [${req.method}] ${req.originalUrl}`);
  console.log(`   Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body:`, req.body);
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `✅ Completed [${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

// ===============================
// 🔹 AUTH SERVICE PROXY
// ===============================
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "/api/auth" },
    cookieDomainRewrite: "",
    logLevel: "debug", // built-in proxy logging
    onProxyReq(proxyReq, req) {
      console.log(`🚀 Forwarding to AUTH → ${process.env.AUTH_SERVICE}${req.originalUrl}`);
    },
    onProxyRes(proxyRes, req) {
      console.log(`🔁 AUTH Response Status: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError(err, req, res) {
      console.error(`❌ AUTH Proxy Error on ${req.originalUrl}:`, err.message);
      res.status(500).json({ error: "Auth service unreachable" });
    },
  })
);

// ===============================
// 🔹 AGENT SERVICE PROXY
// ===============================
app.use(
  "/api/agents",
  createProxyMiddleware({
    target: process.env.AGENT_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/agents": "/api/agents" },
    cookieDomainRewrite: "",
    logLevel: "debug",
    onProxyReq(proxyReq, req) {
      console.log(`🚀 Forwarding to AGENT → ${process.env.AGENT_SERVICE}${req.originalUrl}`);
    },
    onProxyRes(proxyRes, req) {
      console.log(`🔁 AGENT Response Status: ${proxyRes.statusCode} for ${req.originalUrl}`);
    },
    onError(err, req, res) {
      console.error(`❌ AGENT Proxy Error on ${req.originalUrl}:`, err.message);
      res.status(500).json({ error: "Agent service unreachable" });
    },
  })
);

// ===============================
// ✅ Root Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("🟢 StayNext Proxy is active and forwarding requests...");
});

// ===============================
// 🚀 Start Server
// ===============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`
=========================================
✅ StayNext Proxy Server Running
🌍 Environment: ${process.env.NODE_ENV || "development"}
📡 Port: ${PORT}
🔐 AUTH_SERVICE: ${process.env.AUTH_SERVICE}
🧠 AGENT_SERVICE: ${process.env.AGENT_SERVICE}
=========================================
  `);
});
