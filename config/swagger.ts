import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Education Web API Documentation',
      version: '1.0.0',
      description: 'API documentation cho hệ thống bán khóa học trực tuyến',
      contact: {
        name: 'API Support',
        email: 'support@educationweb.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token (lấy từ /api/auth/login hoặc /api/auth/register)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            code: {
              type: 'string',
              example: '400'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Success message'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication & Authorization APIs'
      },
      {
        name: 'Users',
        description: 'User management APIs'
      },
      {
        name: 'Courses',
        description: 'Course management APIs'
      },
      {
        name: 'Categories',
        description: 'Category management APIs'
      },
      {
        name: 'Cart',
        description: 'Shopping cart APIs'
      },
      {
        name: 'Wishlist',
        description: 'Wishlist management APIs'
      },
      {
        name: 'Course Reviews',
        description: 'Course review APIs'
      },
      {
        name: 'Instructor Earnings',
        description: 'Instructor earnings management APIs'
      },
      {
        name: 'Enrollments',
        description: 'Course enrollment APIs'
      },
      {
        name: 'Orders',
        description: 'Order management APIs'
      }
    ]
  },
  apis: ['./router/*.ts', './app.ts', './docs/*.yaml', './docs/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
