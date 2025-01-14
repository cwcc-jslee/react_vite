// src/features/auth/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { setAuthToken, removeAuthToken } from '../utils/authUtils';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      setAuthToken(response.data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    form: {
      username: '',
      password: '',
    },
  },
  reducers: {
    updateForm: (state, action) => {
      state.form[action.payload.field] = action.payload.value;
    },
    clearForm: (state) => {
      state.form = { username: '', password: '' };
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      removeAuthToken();
    },
    restoreAuth: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateForm, clearForm, logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
