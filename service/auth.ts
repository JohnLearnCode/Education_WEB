import { RegisterUserRequest, LoginAuthRequest, User, AuthResponse } from "../types/auth/request";
import * as authModel from '../model/auth.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export const registerAuth = async (authData: RegisterUserRequest): Promise<AuthResponse> => {
  // Check if user already exists by email
  const existingUserByEmail = await authModel.findUserByEmail(authData.email);
  if (existingUserByEmail) {
    throw new Error('Email đã được sử dụng');
  }

  // Check if username already exists
  const existingUserByUsername = await authModel.findUserByUsername(authData.username);
  if (existingUserByUsername) {
    throw new Error('Username đã được sử dụng');
  }

  const registerUser = await authModel.registerAuth(authData);

  if (!registerUser) {
    throw new Error('Không thể tạo tài khoản người dùng');
  }

  // Generate tokens
  const accessToken = generateAccessToken(registerUser);
  const refreshToken = generateRefreshToken(registerUser);

  // Return user without password
  const { password, ...userWithoutPassword } = registerUser;
  
  return {
    user: userWithoutPassword as User,
    token: accessToken
  };
};

export const loginAuth = async (authData: LoginAuthRequest): Promise<AuthResponse> => {
  const user = await authModel.validateUserCredentials(authData.email, authData.password);
  
  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword as User,
    token: accessToken
  };
};

export const refreshTokenAuth = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const { verifyRefreshToken } = await import('../utils/jwt.js');
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await authModel.findUserById(decoded.userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const newAccessToken = generateAccessToken(user);
    
    return {
      accessToken: newAccessToken
    };
  } catch (error) {
    throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
  }
};

export const getProfileAuth = async (userId: string): Promise<Omit<User, 'password'>> => {
  const user = await authModel.findUserById(userId);
  
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as Omit<User, 'password'>;
};