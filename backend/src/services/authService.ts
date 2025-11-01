import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../database/connection';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'event_creator' | 'customer' | 'website_owner';
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
  };
  token: string;
}

export class AuthService {
  // Generate JWT token
  public generateToken(userId: string, email: string, role: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    if (!jwtSecret) {
      throw createError('JWT secret is not configured', 500);
    }

    const payload = { id: userId, email, role };
    const options: SignOptions = { expiresIn: jwtExpiresIn as any };
    
    return jwt.sign(payload, jwtSecret, options);
  }

  // Register a new user
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone, role } = userData;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw createError('User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUser = await db.insert(users).values({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role,
    }).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
    });

    if (newUser.length === 0) {
      throw createError('Failed to create user', 500);
    }

    const user = newUser[0];
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        role: user.role,
      },
      token,
    };
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (userRecords.length === 0) {
      throw createError('Invalid email or password', 401);
    }

    const user = userRecords[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        role: user.role,
      },
      token,
    };
  }

  // Get user profile by ID
  async getProfile(userId: string) {
    const userRecords = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone || undefined,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (userRecords.length === 0) {
      throw createError('User not found', 404);
    }

    return userRecords[0];
  }
}

export const authService = new AuthService();
