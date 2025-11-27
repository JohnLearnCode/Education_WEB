import { Request, Response, NextFunction } from 'express';
import * as wishlistService from '../service/wishlist.js';
import { StatusCodes } from 'http-status-codes';
import { AddToWishlistRequest, RemoveFromWishlistRequest } from '../types/wishlist/request.js';
import { WishlistMessage } from '../types/wishlist/enums.js';
import { ResponseHelper } from '../utils/response.js';

export const getMyWishlist = async (
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

    const wishlist = await wishlistService.getOrCreateWishlist(userId);
    return ResponseHelper.success(
      res,
      WishlistMessage.SUCCESS_GET,
      wishlist,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (
  req: Request<{}, {}, AddToWishlistRequest>,
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

    const wishlist = await wishlistService.addToWishlist(userId, req.body);
    return ResponseHelper.success(
      res,
      WishlistMessage.SUCCESS_ADD,
      wishlist,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request<{}, {}, RemoveFromWishlistRequest>,
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

    const wishlist = await wishlistService.removeFromWishlist(userId, req.body);
    return ResponseHelper.success(
      res,
      WishlistMessage.SUCCESS_REMOVE,
      wishlist,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const moveToCart = async (
  req: Request<{}, {}, AddToWishlistRequest>,
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

    const result = await wishlistService.moveToCart(userId, req.body);
    return ResponseHelper.success(
      res,
      WishlistMessage.SUCCESS_MOVE_TO_CART,
      result,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
