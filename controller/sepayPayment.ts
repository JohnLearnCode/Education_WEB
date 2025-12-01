import { Request, Response, NextFunction } from 'express';
import * as sepayService from '../service/sepayPayment.js';
import { StatusCodes } from 'http-status-codes';
import { ResponseHelper } from '../utils/response.js';
import {
  InitSepayPaymentRequest,
  SepayWebhookData,
  SepayMessage
} from '../types/payment/sepay.js';

/**
 * Initialize SePay payment for an order
 * POST /api/payment/sepay/initiate
 */
export const initiatePayment = async (
  req: Request<{}, {}, InitSepayPaymentRequest>,
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

    const { orderId, paymentMethod } = req.body;

    if (!orderId) {
      return ResponseHelper.error(
        res,
        'Order ID is required',
        StatusCodes.BAD_REQUEST.toString()
      );
    }

    const paymentData = await sepayService.initiateSepayPayment(
      orderId,
      userId,
      paymentMethod || 'BANK_TRANSFER'
    );

    return ResponseHelper.success(
      res,
      SepayMessage.PAYMENT_INITIATED,
      paymentData,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Handle SePay webhook callback
 * POST /api/payment/sepay/webhook
 * This endpoint should be publicly accessible (no auth required)
 */
export const handleWebhook = async (
  req: Request<{}, {}, SepayWebhookData>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('SePay Webhook received:', JSON.stringify(req.body, null, 2));

    const result = await sepayService.handleSepayWebhook(req.body);

    // SePay expects a 200 response to acknowledge receipt
    return res.status(StatusCodes.OK).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('SePay Webhook error:', error);
    // Still return 200 to prevent SePay from retrying
    return res.status(StatusCodes.OK).json({
      success: false,
      message: 'Webhook processing error'
    });
  }
};

/**
 * Verify payment status
 * GET /api/payment/sepay/verify/:orderId
 */
export const verifyPayment = async (
  req: Request<{ orderId: string }>,
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

    const { orderId } = req.params;

    const status = await sepayService.verifyPaymentStatus(orderId, userId);

    return ResponseHelper.success(
      res,
      'Kiểm tra trạng thái thanh toán thành công',
      status,
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get checkout form data (for frontend to render form)
 * POST /api/payment/sepay/checkout-form
 */
export const getCheckoutForm = async (
  req: Request<{}, {}, InitSepayPaymentRequest>,
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

    const { orderId, paymentMethod } = req.body;

    if (!orderId) {
      return ResponseHelper.error(
        res,
        'Order ID is required',
        StatusCodes.BAD_REQUEST.toString()
      );
    }

    const paymentData = await sepayService.initiateSepayPayment(
      orderId,
      userId,
      paymentMethod || 'BANK_TRANSFER'
    );

    // Return HTML form for direct submission
    const formHtml = `
      <form id="sepay-checkout-form" action="${paymentData.checkoutUrl}" method="POST">
        ${Object.entries(paymentData.checkoutFields)
          .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
          .join('\n        ')}
        <button type="submit">Thanh toán ngay</button>
      </form>
    `;

    return ResponseHelper.success(
      res,
      SepayMessage.PAYMENT_INITIATED,
      {
        ...paymentData,
        formHtml
      },
      StatusCodes.OK
    );
  } catch (error) {
    next(error);
  }
};
