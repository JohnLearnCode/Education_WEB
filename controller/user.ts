import { Request, Response, NextFunction } from 'express';
import * as userService from '../service/user.js';
import { StatusCodes } from 'http-status-codes';
import { UpdateUserProfileRequest, UserQueryParams } from '../types/user/request.js';
import { UserMessage } from '../types/user/enums.js';
import { ResponseHelper } from '../utils/response.js';

export const getMyProfile = async (
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

    const profile = await userService.getUserProfile(userId);
    return ResponseHelper.success(
      res,
      UserMessage.SUCCESS_GET,
      profile,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userService.getPublicUserProfile(id);

    return ResponseHelper.success(
      res,
      UserMessage.SUCCESS_GET,
      user,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: Request<{}, {}, UpdateUserProfileRequest>,
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

    const profile = await userService.updateUserProfile(userId, req.body);
    return ResponseHelper.success(
      res,
      UserMessage.SUCCESS_UPDATE,
      profile,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request<{}, {}, {}, UserQueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.getAllUsers(req.query);

    return ResponseHelper.success(
      res,
      UserMessage.SUCCESS_GET,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);

    return ResponseHelper.success(
      res,
      UserMessage.SUCCESS_DELETE,
      { message: 'User deleted successfully' },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
