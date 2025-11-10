import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.js';
import { ResponseHelper } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        username: string;
        isInstructor: boolean;
      };
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      ResponseHelper.error(
        res,
        'Access token is required',
        StatusCodes.UNAUTHORIZED.toString()
      );
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    ResponseHelper.error(
      res,
      'Invalid or expired token',
      StatusCodes.UNAUTHORIZED.toString()
    );
    return;
  }
};

/**
 * Instructor-only Middleware
 * Checks if user is an instructor
 */
export const requireInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ResponseHelper.error(
        res,
        'Authentication required',
        StatusCodes.UNAUTHORIZED.toString()
      );
      return;
    }

    if (!req.user.isInstructor) {
      ResponseHelper.error(
        res,
        'Instructor access required',
        StatusCodes.FORBIDDEN.toString()
      );
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user info if token is valid, but doesn't block if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
