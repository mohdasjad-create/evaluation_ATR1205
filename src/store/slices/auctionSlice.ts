import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {fetchAuctionsApi} from '../../api/auction.api';
import type {
  AuctionState,
  AuctionStatus,
  AuctionsResponse,
} from '../../types/auction.types';

const ITEMS_PER_PAGE = 10;

const initialState: AuctionState = {
  auctions: [],
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
  statusFilter: 'all',
};

// Fetch auctions (initial load or refresh)
export const fetchAuctions = createAsyncThunk<
  AuctionsResponse,
  {refresh?: boolean} | undefined,
  {state: {auction: AuctionState}}
>('auction/fetchAuctions', async (options, {getState, rejectWithValue}) => {
  try {
    const {statusFilter} = getState().auction;
    const response = await fetchAuctionsApi({
      page: 1,
      limit: ITEMS_PER_PAGE,
      status: statusFilter,
    });
    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch auctions',
    );
  }
});

// Fetch more auctions (pagination)
export const fetchMoreAuctions = createAsyncThunk<
  AuctionsResponse,
  void,
  {state: {auction: AuctionState}}
>('auction/fetchMoreAuctions', async (_, {getState, rejectWithValue}) => {
  try {
    const {page, statusFilter} = getState().auction;
    const response = await fetchAuctionsApi({
      page: page + 1,
      limit: ITEMS_PER_PAGE,
      status: statusFilter,
    });
    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to load more auctions',
    );
  }
});

const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    setStatusFilter: (
      state,
      action: PayloadAction<AuctionStatus | 'all'>,
    ) => {
      state.statusFilter = action.payload;
      state.auctions = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearAuctionError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch Auctions (initial/refresh)
    builder
      .addCase(fetchAuctions.pending, (state, action) => {
        if (action.meta.arg?.refresh) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.auctions = action.payload.data;
        state.page = action.payload.meta.page;
        state.hasMore = action.payload.meta.page < action.payload.meta.totalPages;
        state.error = null;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      });

    // Fetch More Auctions (pagination)
    builder
      .addCase(fetchMoreAuctions.pending, state => {
        state.isLoadingMore = true;
      })
      .addCase(fetchMoreAuctions.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        state.auctions = [...state.auctions, ...action.payload.data];
        state.page = action.payload.meta.page;
        state.hasMore = action.payload.meta.page < action.payload.meta.totalPages;
      })
      .addCase(fetchMoreAuctions.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload as string;
      });
  },
});

export const {setStatusFilter, clearAuctionError} = auctionSlice.actions;
export default auctionSlice.reducer;
