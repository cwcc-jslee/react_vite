// src/features/sfa/store/sfaSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  drawer: {
    visible: false,
    mode: 'view',
    data: null,
  },
  filter: {},
  loading: false,
  error: null,
};

const sfaSlice = createSlice({
  name: 'sfa',
  initialState,
  reducers: {
    setDrawer: (state, action) => {
      state.drawer = { ...state.drawer, ...action.payload };
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    // Other reducers...
  },
  extraReducers: (builder) => {
    // Handle async actions...
  },
});

export const { setDrawer, setFilter } = sfaSlice.actions;
export default sfaSlice.reducer;
