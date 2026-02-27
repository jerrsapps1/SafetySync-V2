import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { configureCors } from "./cors";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(configureCors());

// ✅ MUST come before everything else (so it can't be swallowed by SPA fallback)
app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "api" }));
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, service: "api" }));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "2mb" }));

// ✅ request logging (proves what route is being hit)
app.use((req, _res, next) => {
  log(`[REQ] ${req.method} ${req.path}`);
  next();
});

(async () => {
  if (process.env.SEED_DATABASE === "true") {
    const { seedDatabase } = await import("./seed");
    await seedDatabase();
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const host =
    process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  server.listen(port, host, () => {
    log(`Server running on http://${host}:${port}`);
  });
})();