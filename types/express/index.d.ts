import { User as PassportUser } from 'passport';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        isInstructor: boolean;
        isAdmin: boolean;
      };
    }
  }
}

// Override Passport's User type
declare module 'passport' {
  interface User {
    userId: string;
    email: string;
    isInstructor: boolean;
    isAdmin: boolean;
  }
}
