import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  orgId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    orgId: string | null;
  };
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7);

    if (process.env.NODE_ENV !== "production") {
      if (token === "mock-token") {
        (req as any).user = {
          id: "user-1",
          email: "manager@democonstruction.com",
          role: "workspace_user",
          orgId: "org-1",
        };
        return next();
      }
      if (token === "mock-admin-token") {
        (req as any).user = {
          id: "admin-1",
          email: "admin@syncai.com",
          role: "owner_admin",
          orgId: null,
        };
        return next();
      }
    }

    const payload = verifyToken(token);

    (req as any).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role || "workspace_user",
      orgId: payload.orgId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export const authMiddleware = requireAuth;

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
