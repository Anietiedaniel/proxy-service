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
      "https://stay-next-frontend-production.up.railway.app", // 🔁 change to your actual frontend domain
    ],
    credentials: true,
  })
);

// =============================================
// 🔹 AUTH SERVICE PROXY
// =============================================
// When frontend calls → /api/auth/login
// This proxy forwards → https://auth-service.onrender.com/api/auth/login
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "/api/auth" }, // keep same path
    cookieDomainRewrite: "", // allows cookie to stay under proxy domain
  })
);

// =============================================
// 🔹 AGENT SERVICE PROXY
// =============================================
// When frontend calls → /api/agents/verification/submit
// This proxy forwards → https://agent-service.onrender.com/api/agents/verification/submit
app.use(
  "/api/agents",
  createProxyMiddleware({
    target: process.env.AGENT_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/agents": "/api/agents" }, // keep same path
    cookieDomainRewrite: "",
  })
);

// =============================================
// ✅ Test Route
// =============================================
app.get("/", (req, res) => {
  res.send("🟢 StayNext Proxy is active and forwarding requests...");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Proxy running on port ${PORT}`)
);
