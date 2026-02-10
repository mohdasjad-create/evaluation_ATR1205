export type AuctionStatus = 'draft' | 'active' | 'sold' | 'expired';

export interface Creator {
  id: string;
  email: string;
  balance: string;
  createdAt: string;
}

export interface Bidder {
  id: string;
  email: string;
  balance: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  amount: string;
  bidderId: string;
  auctionItemId: string;
  createdAt: string;
  bidder: Bidder;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  currentPrice: string;
  status: AuctionStatus;
  creatorId: string;
  winnerId: string | null;
  endsAt: string;
  createdAt: string;
  version: number;
  creator: Creator;
  winner: Creator | null;
}

export interface AuctionWithBids extends Auction {
  bids: Bid[];
}

export interface AuctionState {
  auctions: Auction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  statusFilter: AuctionStatus | 'all';
}

export interface AuctionDetailState {
  auction: AuctionWithBids | null;
  isLoading: boolean;
  isPlacingBid: boolean;
  error: string | null;
  bidError: string | null;
}

export interface FetchAuctionsParams {
  page: number;
  limit: number;
  status?: AuctionStatus | 'all';
}

export interface AuctionsResponse {
  data: Auction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PlaceBidParams {
  auctionId: string;
  amount: number;
}
