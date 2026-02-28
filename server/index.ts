import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { configureCors } from "./cors";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(configureCors());

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

// ✅ Health endpoints (JSON + DB check)
app.get("/health", (_req, res) => res.status(200).json({ ok: true, service: "api" }));

app.get("/api/health", async (_req, res) => {
  const startedAt = Date.now();

  // Minimal environment info (non-sensitive)
  const env = process.env.NODE_ENV || "unknown";
  const port = process.env.PORT || "unknown";

  try {
    // Drizzle supports `execute(sql`...`)` in many setups, but to keep it universal:
    // We'll do a trivial "SELECT 1" through the underlying client if available.
    // Most Drizzle pg adapters expose `db.execute`.
    // If your adapter doesn't, we can switch to `pool.query` instead.
    // @ts-expect-error - execute exists for most Drizzle pg setups
    await db.execute("select 1");

    return res.status(200).json({
      ok: true,
      service: "api",
      env,
      port,
      db: "connected",
      ms: Date.now() - startedAt,
    });
  } catch (e: any) {
    log(`[HEALTH] DB check failed: ${e?.message || String(e)}`);
    return res.status(500).json({
      ok: false,
      service: "api",
      env,
      port,
      db: "error",
      error: "db_unreachable",
      ms: Date.now() - startedAt,
    });
  }
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

  const portNum = parseInt(process.env.PORT || "5000", 10);
  const host =
    process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  server.listen(portNum, host, () => {
    log(`Server running on http://${host}:${portNum}`);
  });
})();