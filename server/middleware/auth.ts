import { Request, Response, NextFunction } from "express";

// Simple session store - in production, use Redis or database
const sessions = new Map<string, { userId: number; role: string }>();

export function setSession(sessionId: string, user: { userId: number; role: string }) {
  sessions.set(sessionId, user);
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}

export function removeSession(sessionId: string) {
  sessions.delete(sessionId);
}

// Add user property to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string; userId: number };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = sessions.get(sessionId)!;
  req.user = { id: session.userId, role: session.role, userId: session.userId };
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};