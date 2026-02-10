import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';
import {ThemeMode} from '../../types/theme.types';

interface ThemeState {
  mode: ThemeMode;
  isInitialized: boolean;
}

const initialState: ThemeState = {
  mode: 'dark',
  isInitialized: false,
};

export const loadTheme = createAsyncThunk('theme/load', async () => {
  try {
    const savedTheme = await EncryptedStorage.getItem('theme_mode');
    return (savedTheme as ThemeMode) || 'dark';
  } catch (error) {
    return 'dark';
  }
});

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      EncryptedStorage.setItem('theme_mode', state.mode);
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      EncryptedStorage.setItem('theme_mode', state.mode);
    },
  },
  extraReducers: builder => {
    builder.addCase(loadTheme.fulfilled, (state, action) => {
      state.mode = action.payload;
      state.isInitialized = true;
    });
  },
});

export const {toggleTheme, setTheme} = themeSlice.actions;
export default themeSlice.reducer;
