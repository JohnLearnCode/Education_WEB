import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to check if the authenticated user has admin role
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      ResponseHelper.error(
        res,
        'Authentication required',
        StatusCodes.UNAUTHORIZED.toString()
      );
      return;
    }

    // Check if user has admin role
    if (!(req.user as any).isAdmin) {
      ResponseHelper.error(
        res,
        'Access denied. Admin privileges required.',
        StatusCodes.FORBIDDEN.toString()
      );
      return;
    }

    // User is admin, proceed to next middleware/controller
    next();
  } catch (error) {
    console.error('Error in requireAdmin middleware:', error);
    ResponseHelper.error(
      res,
      'Authorization check failed',
      StatusCodes.INTERNAL_SERVER_ERROR.toString()
    );
  }
};
