import {API_BASE_URL} from './config';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth.types';

export const loginApi = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  console.log('[AUTH API] Login request:', {
    url: `${API_BASE_URL}/api/auth/login`,
    email: credentials.email,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    console.log('[AUTH API] Login response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[AUTH API] Login error:', errorData);
      throw new Error(errorData.message || 'Login failed. Please try again.');
    }

    const data = await response.json();
    console.log('[AUTH API] Login full response:', JSON.stringify(data, null, 2));
    
    // Support both 'token' and 'access_token'
    const token = data.token || data.access_token || data.accessToken;
    
    console.log('[AUTH API] Login success:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasToken: !!token,
      tokenKey: data.token ? 'token' : (data.access_token ? 'access_token' : (data.accessToken ? 'accessToken' : 'none')),
    });
    
    return {
      ...data,
      token: token // Normalize to 'token' for the rest of the app
    };
  } catch (error) {
    console.log('[AUTH API] Login exception:', error);
    throw error;
  }
};

export const registerApi = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  console.log('[AUTH API] Register request:', {
    url: `${API_BASE_URL}/api/auth/register`,
    email: credentials.email,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    console.log('[AUTH API] Register response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[AUTH API] Register error:', errorData);
      throw new Error(
        errorData.message || 'Registration failed. Please try again.',
      );
    }

    const data = await response.json();
    const token = data.token || data.access_token || data.accessToken;
    
    console.log('[AUTH API] Register success:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasToken: !!token,
    });
    
    return {
      ...data,
      token: token
    };
  } catch (error) {
    console.log('[AUTH API] Register exception:', error);
    throw error;
  }
};
