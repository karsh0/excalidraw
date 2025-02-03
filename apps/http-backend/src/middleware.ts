import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

declare global {
    namespace Express {
      interface Request {
        userId: string
      }
    }
  }


export function middleware(req: Request, res: Response, next: NextFunction){
    const token = req.headers["authorization"] ?? "";

    const decoded = jwt.verify(token, JWT_SECRET);
    if(!token || !decoded){
        res.status(411).json({
          message: "Authentication failed"
        })
        return;
    }
    req.userId = (decoded as JwtPayload).userId;
    next()
}