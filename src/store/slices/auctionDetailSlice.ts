import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchAuctionDetailApi, placeBidApi} from '../../api/auction.api';
import type {
  AuctionDetailState,
  AuctionWithBids,
  Bid,
} from '../../types/auction.types';

const initialState: AuctionDetailState = {
  auction: null,
  isLoading: false,
  isPlacingBid: false,
  error: null,
  bidError: null,
};

// Fetch auction details
export const fetchAuctionDetail = createAsyncThunk<
  AuctionWithBids,
  string,
  {rejectValue: string}
>('auctionDetail/fetch', async (auctionId, {rejectWithValue}) => {
  try {
    const response = await fetchAuctionDetailApi(auctionId);
    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch auction',
    );
  }
});

// Place bid
export const placeBid = createAsyncThunk<
  {auctionId: string; amount: number},
  {auctionId: string; amount: number},
  {rejectValue: string}
>('auctionDetail/placeBid', async ({auctionId, amount}, {rejectWithValue}) => {
  try {
    await placeBidApi(auctionId, amount);
    return {auctionId, amount};
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to place bid',
    );
  }
});

const auctionDetailSlice = createSlice({
  name: 'auctionDetail',
  initialState,
  reducers: {
    clearAuctionDetail: state => {
      state.auction = null;
      state.error = null;
      state.bidError = null;
    },
    clearBidError: state => {
      state.bidError = null;
    },
    // For real-time bid updates via WebSocket
    addNewBid: (state, action: {payload: Bid}) => {
      if (state.auction) {
        state.auction.bids = [action.payload, ...state.auction.bids];
        state.auction.currentPrice = action.payload.amount;
      }
    },
    updateAuctionStatus: (
      state,
      action: {payload: {status: string; winnerId?: string}},
    ) => {
      if (state.auction) {
        state.auction.status = action.payload.status as any;
        if (action.payload.winnerId) {
          state.auction.winnerId = action.payload.winnerId;
        }
      }
    },
    updateAuctionEndsAt: (state, action: {payload: {endsAt: string}}) => {
      if (state.auction) {
        state.auction.endsAt = action.payload.endsAt;
      }
    },
  },
  extraReducers: builder => {
    // Fetch Auction Detail
    builder
      .addCase(fetchAuctionDetail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuctionDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auction = action.payload;
        state.error = null;
      })
      .addCase(fetchAuctionDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Place Bid
    builder
      .addCase(placeBid.pending, state => {
        state.isPlacingBid = true;
        state.bidError = null;
      })
      .addCase(placeBid.fulfilled, state => {
        state.isPlacingBid = false;
        state.bidError = null;
        // Auction data will be refreshed or updated via WebSocket
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.isPlacingBid = false;
        state.bidError = action.payload as string;
      });
  },
});

export const {
  clearAuctionDetail,
  clearBidError,
  addNewBid,
  updateAuctionStatus,
  updateAuctionEndsAt,
} = auctionDetailSlice.actions;
export default auctionDetailSlice.reducer;
