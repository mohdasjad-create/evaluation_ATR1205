import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SocketState {
  isConnected: boolean;
  error: string | null;
}

const initialState: SocketState = {
  isConnected: false,
  error: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setSocketError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setConnected, setSocketError} = socketSlice.actions;
export default socketSlice.reducer;
