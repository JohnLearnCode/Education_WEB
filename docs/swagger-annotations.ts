/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "673d5f8e9b1c2a3d4e5f6789"
 *         name:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         avatarUrl:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 *         isInstructor:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: "Khóa học lập trình Web"
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           example: 1000000
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         rating:
 *           type: number
 *           example: 4.5
 *         imageUrl:
 *           type: string
 *         instructorId:
 *           type: string
 *         categoryId:
 *           type: string
 *     
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         courses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Wishlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         courses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CourseReview:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         courseId:
 *           type: string
 *         userId:
 *           type: string
 *         userName:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     InstructorEarnings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         instructorId:
 *           type: string
 *         courseId:
 *           type: string
 *         orderId:
 *           type: string
 *         amount:
 *           type: number
 *           example: 1000000
 *         platformFee:
 *           type: number
 *           example: 100000
 *         netEarning:
 *           type: number
 *           example: 900000
 *         status:
 *           type: string
 *           enum: [pending, processing, paid, cancelled]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         paidAt:
 *           type: string
 *           format: date-time
 */

export {};
