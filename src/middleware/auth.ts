import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";

declare global {
  namespace Express {
    interface Request {
      auth0Id: string;
      userId: string;
    }
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASEURL,
  tokenSigningAlg: "RS256",
});

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).json({ message: "Token not found" });
  }

  const [, token] = authorization.split(" ");
  try {
    const decodedToken = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decodedToken.sub;
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ message: "Token not valid" });
  }
};
