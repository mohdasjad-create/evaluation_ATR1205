import {API_BASE_URL} from './config';
import EncryptedStorage from 'react-native-encrypted-storage';
import type {User} from '../types/auth.types';

export interface WonAuction {
  id: string;
  title: string;
  description: string;
  finalPrice: string;
  soldAt: string;
  endsAt: string;
}

export interface UserProfile extends User {
  balance: string;
  createdAt: string;
  wonAuctions: WonAuction[];
}

export const fetchProfileApi = async (): Promise<UserProfile> => {
  const token = await EncryptedStorage.getItem('auth_token');
  const url = `${API_BASE_URL}/api/users/me`;
  console.log('[API] GET fetchProfile:', url);

  if (!token) {
    console.warn('[API] GET fetchProfile: No token found');
    throw new Error('Please login to view profile');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] GET fetchProfile ERROR:', response.status, errorData);
      throw new Error(
        errorData.message || 'Failed to fetch profile. Please try again.',
      );
    }

    const data = await response.json();
    console.log('[API] GET fetchProfile SUCCESS:', data.email);
    return data;
  } catch (error) {
    console.error('[API] GET fetchProfile EXCEPTION:', error);
    throw error;
  }
};
