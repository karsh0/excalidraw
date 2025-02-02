import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

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
        return;
    }
    req.userId = (decoded as JwtPayload).userId;
    next()
}