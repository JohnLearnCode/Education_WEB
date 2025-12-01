import { Router } from 'express';
import * as sepayController from '../controller/sepayPayment.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @swagger
 * /api/payment/sepay/initiate:
 *   post:
 *     summary: Khởi tạo thanh toán SePay
 *     tags: [Payment - SePay]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID của đơn hàng
 *               paymentMethod:
 *                 type: string
 *                 enum: [BANK_TRANSFER, NAPAS_BANK_TRANSFER]
 *                 default: BANK_TRANSFER
 *     responses:
 *       200:
 *         description: Khởi tạo thanh toán thành công
 */
router.post(
  '/initiate',
  authenticateToken,
  sepayController.initiatePayment
);

/**
 * @swagger
 * /api/payment/sepay/checkout-form:
 *   post:
 *     summary: Lấy form checkout để submit trực tiếp
 *     tags: [Payment - SePay]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [BANK_TRANSFER, NAPAS_BANK_TRANSFER]
 *     responses:
 *       200:
 *         description: Lấy form checkout thành công
 */
router.post(
  '/checkout-form',
  authenticateToken,
  sepayController.getCheckoutForm
);

/**
 * @swagger
 * /api/payment/sepay/verify/{orderId}:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán
 *     tags: [Payment - SePay]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái thanh toán
 */
router.get(
  '/verify/:orderId',
  authenticateToken,
  sepayController.verifyPayment
);

/**
 * @swagger
 * /api/payment/sepay/webhook:
 *   post:
 *     summary: Webhook callback từ SePay (không cần auth)
 *     tags: [Payment - SePay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_invoice_number:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *               transaction_status:
 *                 type: string
 *                 enum: [SUCCESS, FAILED, PENDING, CANCELLED]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               timestamp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook đã được xử lý
 */
router.post(
  '/webhook',
  sepayController.handleWebhook
);

/**
 * @swagger
 * /api/payment/sepay/manual-complete/{orderId}:
 *   post:
 *     summary: Hoàn thành thanh toán thủ công (chỉ dùng cho development)
 *     tags: [Payment - SePay]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thanh toán đã được hoàn thành
 *       403:
 *         description: Chỉ khả dụng trong môi trường development
 */
router.post(
  '/manual-complete/:orderId',
  authenticateToken,
  sepayController.manualCompletePayment
);

export default router;
