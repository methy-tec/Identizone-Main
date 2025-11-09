import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Gestion des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Middleware pour JSON et fichiers statiques
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔀 Proxy vers le backend Render
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://identizone.onrender.com",
    changeOrigin: true,
    pathRewrite: { "^/api": "/api" },
  })
);

// Route par défaut → page login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
});
