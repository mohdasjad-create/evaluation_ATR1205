import {API_BASE_URL} from './config';
import EncryptedStorage from 'react-native-encrypted-storage';
import type {
  FetchAuctionsParams,
  AuctionsResponse,
  AuctionWithBids,
  Auction,
} from '../types/auction.types';

export const fetchAuctionsApi = async (
  params: FetchAuctionsParams,
): Promise<AuctionsResponse> => {
  const token = await EncryptedStorage.getItem('auth_token');

  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params.status && params.status !== 'all') {
    queryParams.append('status', params.status);
  }

  const url = `${API_BASE_URL}/api/auctions?${queryParams.toString()}`;
  console.log('[API] GET fetchAuctions:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] GET fetchAuctions ERROR:', response.status, errorData);
      throw new Error(
        errorData.message || 'Failed to fetch auctions. Please try again.',
      );
    }

    const data = await response.json();
    console.log('[API] GET fetchAuctions SUCCESS:', {
      count: data.data?.length,
      page: data.meta?.page,
    });
    return data;
  } catch (error) {
    console.error('[API] GET fetchAuctions EXCEPTION:', error);
    throw error;
  }
};

export const fetchAuctionDetailApi = async (
  auctionId: string,
): Promise<AuctionWithBids> => {
  const token = await EncryptedStorage.getItem('auth_token');
  const url = `${API_BASE_URL}/api/auctions/${auctionId}`;
  console.log('[API] GET fetchAuctionDetail:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] GET fetchAuctionDetail ERROR:', response.status, errorData);
      throw new Error(
        errorData.message || 'Failed to fetch auction details. Please try again.',
      );
    }

    const data = await response.json();
    console.log('[API] GET fetchAuctionDetail SUCCESS:', data.title);
    return data;
  } catch (error) {
    console.error('[API] GET fetchAuctionDetail EXCEPTION:', error);
    throw error;
  }
};

export const placeBidApi = async (
  auctionId: string,
  amount: number,
): Promise<Auction> => {
  const token = await EncryptedStorage.getItem('auth_token');
  const url = `${API_BASE_URL}/api/auctions/${auctionId}/bid`;
  console.log('[API] POST placeBid:', url, {amount});

  if (!token) {
    throw new Error('Please login to place a bid');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({amount}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] POST placeBid ERROR:', response.status, errorData);
      throw new Error(
        errorData.message || 'Failed to place bid. Please try again.',
      );
    }

    const data = await response.json();
    console.log('[API] POST placeBid SUCCESS:', data.currentPrice);
    return data;
  } catch (error) {
    console.error('[API] POST placeBid EXCEPTION:', error);
    throw error;
  }
};
