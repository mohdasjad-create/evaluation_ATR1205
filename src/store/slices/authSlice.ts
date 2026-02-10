import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';
import {loginApi, registerApi} from '../../api/auth.api';
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from '../../types/auth.types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoring: true,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, {rejectWithValue}) => {
    console.log('[AUTH SLICE] loginUser thunk started');
    try {
      const response = await loginApi(credentials);
      console.log('[AUTH SLICE] loginUser API returned:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
      });
      // Store token securely if it exists
      if (response.token) {
        await EncryptedStorage.setItem('auth_token', response.token);
      } else {
        console.warn('[AUTH SLICE] No token received in login response');
      }
      
      if (response.user) {
        await EncryptedStorage.setItem('user', JSON.stringify(response.user));
      }
      console.log('[AUTH SLICE] loginUser stored credentials');
      return response;
    } catch (error) {
      console.log('[AUTH SLICE] loginUser error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed',
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, {rejectWithValue}) => {
    console.log('[AUTH SLICE] registerUser thunk started');
    try {
      const response = await registerApi(credentials);
      console.log('[AUTH SLICE] registerUser API returned:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
      });
      // Store token securely if it exists
      if (response.token) {
        await EncryptedStorage.setItem('auth_token', response.token);
      } else {
        console.warn('[AUTH SLICE] No token received in register response');
      }

      if (response.user) {
        await EncryptedStorage.setItem('user', JSON.stringify(response.user));
      }
      console.log('[AUTH SLICE] registerUser stored credentials');
      return response;
    } catch (error) {
      console.log('[AUTH SLICE] registerUser error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Registration failed',
      );
    }
  },
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, {rejectWithValue}) => {
    console.log('[AUTH SLICE] restoreSession thunk started');
    try {
      const token = await EncryptedStorage.getItem('auth_token');
      const userString = await EncryptedStorage.getItem('user');
      console.log('[AUTH SLICE] restoreSession found:', {
        hasToken: !!token,
        hasUser: !!userString,
      });

      if (token && userString) {
        const user = JSON.parse(userString);
        console.log('[AUTH SLICE] restoreSession restored session for:', user.email);
        return {token, user};
      }
      console.log('[AUTH SLICE] restoreSession no session found');
      return null;
    } catch (error) {
      console.log('[AUTH SLICE] restoreSession error:', error);
      return rejectWithValue('Failed to restore session');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  console.log('[AUTH SLICE] logoutUser thunk started');
  await EncryptedStorage.removeItem('auth_token');
  await EncryptedStorage.removeItem('user');
  console.log('[AUTH SLICE] logoutUser cleared storage');
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Restore Session
    builder
      .addCase(restoreSession.pending, state => {
        state.isRestoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isRestoring = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(restoreSession.rejected, state => {
        state.isRestoring = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const {clearError} = authSlice.actions;
export default authSlice.reducer;
