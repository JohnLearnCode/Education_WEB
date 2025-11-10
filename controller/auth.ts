import { Request, Response, NextFunction } from 'express';
import * as authService from '../service/auth.js';
import { StatusCodes } from 'http-status-codes';
import { RegisterUserRequest, LoginAuthRequest } from '../types/auth/request.js';
import { AuthMessage } from '../types/auth/enums.js';
import { ResponseHelper } from '../utils/response.js';

export const registerAuth = async (
  req: Request<{}, {}, RegisterUserRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authResult = await authService.registerAuth(req.body);
    return ResponseHelper.success(
      res,
      AuthMessage.SUCCESS_CREATE,
      authResult,
      StatusCodes.CREATED
    );
  } catch (error) {
    next(error);
  }
};

export const loginAuth = async (
  req: Request<{}, {}, LoginAuthRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const authResult = await authService.loginAuth(req.body);
    return ResponseHelper.success(
      res,
      AuthMessage.SUCCESS_LOGIN,
      authResult,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokenAuth(refreshToken);
    return ResponseHelper.success(
      res,
      'Token refreshed successfully',
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ResponseHelper.error(
        res,
        'Unauthorized',
        StatusCodes.UNAUTHORIZED.toString()
      );
    }

    const user = await authService.getProfileAuth(userId);
    return ResponseHelper.success(
      res,
      'Get profile successfully',
      user,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

