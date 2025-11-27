import { Request, Response, NextFunction } from 'express';
import { generateAccessToken } from '../utils/jwt.js';
import { User } from '../types/user/request.js';

/**
 * Initiates Google OAuth flow
 * This is handled by passport.authenticate middleware
 */
export const googleAuth = () => {
  // This function is just a placeholder
  // The actual authentication is handled by passport middleware
};

/**
 * Google OAuth callback handler
 * Called after user authorizes with Google
 */
export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any as User;

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    // Generate JWT token
    const token = generateAccessToken(user);

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    // Redirect to frontend with token and user data
    // Frontend will extract these from URL and store in localStorage
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`;
    
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};

/**
 * Google OAuth failure handler
 */
export const googleAuthFailure = (
  req: Request,
  res: Response
) => {
  return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
};
