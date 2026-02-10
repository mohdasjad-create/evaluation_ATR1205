import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchProfileApi, UserProfile} from '../../api/user.api';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk<
  UserProfile,
  void,
  {rejectValue: string}
>('user/fetchProfile', async (_, {rejectWithValue}) => {
  try {
    const response = await fetchProfileApi();
    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch profile',
    );
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    updateBalance: (state, action: {payload: string}) => {
      if (state.profile) {
        state.profile.balance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearUserError, updateBalance} = userSlice.actions;
export default userSlice.reducer;
