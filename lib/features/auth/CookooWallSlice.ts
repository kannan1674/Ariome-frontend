import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CookooWallState {
  isLoading: boolean;
  error: string | null;
  list: unknown[];
  detail: unknown;
}

const initialState: CookooWallState = {
  isLoading: false,
  error: null,
  list: [],
  detail: null,
};

const cookooWallSlice = createSlice({
  name: 'cookooWall',
  initialState,
  reducers: {
    cookooWallListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    cookooWallListSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.isLoading = false;
      state.list = action.payload;
    },
    cookooWallListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    cookooWallDetailRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    cookooWallDetailSuccess: (state, action: PayloadAction<unknown>) => {
      state.isLoading = false;
      state.detail = action.payload;
    },
    cookooWallDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  cookooWallListRequest,
  cookooWallListSuccess,
  cookooWallListFailure,
  cookooWallDetailRequest,
  cookooWallDetailSuccess,
  cookooWallDetailFailure,
} = cookooWallSlice.actions;

export default cookooWallSlice.reducer;
