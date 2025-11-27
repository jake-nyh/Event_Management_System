import { Router, Response } from 'express';
import { authService } from '../services/authService';
import { validate, registerSchema, loginSchema } from '../utils/validation';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router: Router = Router();

// User registration
router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    });
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});

// User login
router.post('/login', validate(loginSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login({ email, password });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

// User logout
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  // In a stateless JWT implementation, logout is typically handled client-side
  // by removing the token. Here we'll just return a success message.
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw createError('User not found', 404);
    }
    
    const { id, email, role } = req.user;
    const token = authService.generateToken(id, email, role);
    
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw createError('User not found', 404);
    }
    
    const userId = req.user.id;
    const userProfile = await authService.getProfile(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: userProfile,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve profile',
    });
  }
});

export default router;