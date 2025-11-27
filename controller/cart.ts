import { Request, Response, NextFunction } from 'express';
import * as cartService from '../service/cart.js';
import { StatusCodes } from 'http-status-codes';
import { AddToCartRequest, RemoveFromCartRequest } from '../types/cart/request.js';
import { CartMessage } from '../types/cart/enums.js';
import { ResponseHelper } from '../utils/response.js';

export const getMyCart = async (
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

    const cart = await cartService.getOrCreateCart(userId);
    return ResponseHelper.success(
      res,
      CartMessage.SUCCESS_GET,
      cart,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: Request<{}, {}, AddToCartRequest>,
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

    const cart = await cartService.addToCart(userId, req.body);
    return ResponseHelper.success(
      res,
      CartMessage.SUCCESS_ADD,
      cart,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request<{}, {}, RemoveFromCartRequest>,
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

    const cart = await cartService.removeFromCart(userId, req.body);
    return ResponseHelper.success(
      res,
      CartMessage.SUCCESS_REMOVE,
      cart,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
