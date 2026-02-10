import {API_BASE_URL} from './config';
import EncryptedStorage from 'react-native-encrypted-storage';
import type {Auction} from '../types/auction.types';

export interface CreateAuctionParams {
  title: string;
  description: string;
  startingPrice: number;
  endsAt: string;
}

export const createAuctionApi = async (
  params: CreateAuctionParams,
): Promise<Auction> => {
  const token = await EncryptedStorage.getItem('auth_token');
  const url = `${API_BASE_URL}/api/auctions`;
  console.log('[API] POST createAuction:', url, params.title);

  if (!token) {
    console.warn('[API] POST createAuction: No token found');
    throw new Error('Please login to create an auction');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    console.log('[API] POST createAuction:', JSON.stringify(params));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] POST createAuction ERROR:', response.status, errorData);
      throw new Error(
        errorData.message || 'Failed to create auction. Please try again.',
      );
    }

    const data = await response.json();
    console.log('[API] POST createAuction SUCCESS:', data.id);
    return data;
  } catch (error) {
    console.error('[API] POST createAuction EXCEPTION:', error);
    throw error;
  }
};
