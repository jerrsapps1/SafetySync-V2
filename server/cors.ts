import cors from "cors";

/**
 * CORS configuration
 * - Allows local dev frontends (Vite: 5173, React: 3000, etc.)
 * - Allows production origins via env
 *
 * Set these in Render/production as needed:
 *   CORS_ORIGINS="https://safetysync.ai,https://www.safetysync.ai"
 * Optional:
 *   BACKEND_ORIGIN="https://your-api-domain"
 */
export function configureCors() {
  const envOriginsRaw =
    process.env.CORS_ORIGINS ||
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.ALLOWED_ORIGINS ||
    "";

  const envOrigins = envOriginsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Local dev defaults (safe + explicit)
  const localOrigins = new Set<string>([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
  ]);

  // If you have a Vite proxy or other local ports, you can add them here:
  // localOrigins.add("http://localhost:4173");

  const allowedOrigins = new Set<string>([...envOrigins, ...localOrigins]);

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server, same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) return callback(null, true);

      // Helpful debug output (shows the origin causing the block)
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
    exposedHeaders: ["set-cookie"]
  };

  return cors(corsOptions);
}