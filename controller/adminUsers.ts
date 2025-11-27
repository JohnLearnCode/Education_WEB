import { Request, Response, NextFunction } from 'express';
import { adminUsersService } from '../service/adminUsers';
import { ResponseHelper } from '../utils/response.js';

/**
 * Get all users with pagination and filters
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = 'all' 
    } = req.query;

    const result = await adminUsersService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      role: String(role),
    });

    ResponseHelper.success(
      res,
      'Users retrieved successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await adminUsersService.getUserById(userId);

    ResponseHelper.success(
      res,
      'User retrieved successfully',
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isInstructor, isAdmin } = req.body;

    const user = await adminUsersService.updateUserRole(userId, {
      isInstructor,
      isAdmin,
    });

    ResponseHelper.success(
      res,
      'User role updated successfully',
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Disable/Enable user
 */
export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await adminUsersService.toggleUserStatus(userId, isActive);

    ResponseHelper.success(
      res,
      `User ${isActive ? 'enabled' : 'disabled'} successfully`,
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    await adminUsersService.deleteUser(userId);

    ResponseHelper.success(
      res,
      'User deleted successfully',
      null
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
export const getUsersStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminUsersService.getUsersStats();

    ResponseHelper.success(
      res,
      'User statistics retrieved successfully',
      stats
    );
  } catch (error) {
    next(error);
  }
};
