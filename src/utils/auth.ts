import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthedRequest extends Request {
  user?: { id: string; role: string };
}

export function auth(requiredRoles?: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
