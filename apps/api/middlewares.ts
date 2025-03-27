import type { Request, Response, NextFunction } from "express";
import { PUBLIC_KEY_JWT } from "./config";
import jwt from "jsonwebtoken";

export function AuthMiddleware (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const decoded = jwt.verify(token, PUBLIC_KEY_JWT)

  if (!decoded || !decoded.sub) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  req.UserId = decoded.sub as string

  next()
}