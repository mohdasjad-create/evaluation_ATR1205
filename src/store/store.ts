import {configureStore} from '@reduxjs/toolkit';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';
import authReducer from './slices/authSlice';
import auctionReducer from './slices/auctionSlice';
import auctionDetailReducer from './slices/auctionDetailSlice';
import socketReducer from './slices/socketSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    auction: auctionReducer,
    auctionDetail: auctionDetailReducer,
    socket: socketReducer,
    user: userReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
