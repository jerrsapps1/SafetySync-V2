import cors from "cors";

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://app.safetysync.ai",
    "https://admin.safetysync.ai",
  ];
}

const isDev = process.env.NODE_ENV === "development";

export function configureCors() {
  const allowedOrigins = getAllowedOrigins();

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (isDev && (origin.endsWith(".replit.dev") || origin.endsWith(".repl.co"))) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}
