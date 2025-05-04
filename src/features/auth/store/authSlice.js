// src/features/auth/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import {
  setAuthToken,
  setUserData,
  removeAuthToken,
} from '../../../shared/services/authService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const { jwt } = response.data;
      setAuthToken(jwt);

      // 로그인 성공 후 사용자 정보와 팀 정보를 함께 가져옴
      const userResponse = await authApi.getMe(jwt);
      const userData = {
        ...response.data,
        user: userResponse.data,
      };

      // 사용자 정보 저장
      setUserData(userData);

      return userData;
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
