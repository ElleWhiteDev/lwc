import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { initDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import eventsRoutes from "./routes/events.js";
import adminRoutes from "./routes/admin.js";
import imagesRoutes from "./routes/images.js";
import boardMembersRoutes from "./routes/boardMembers.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.use(cookieParser());

if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
}

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api", eventsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", imagesRoutes);
app.use("/api", boardMembersRoutes);

const distPath = path.resolve(__dirname, "..", "dist");

app.use(express.static(distPath));

// Serve index.html for all non-API routes (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
