import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'event_creator' | 'customer' | 'website_owner';
}

export interface AuthResponse {
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

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  // Register new user
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Logout user
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh');
    return response.data.data;
  },
};