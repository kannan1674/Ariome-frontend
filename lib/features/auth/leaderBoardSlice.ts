import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeaderBoardState {
  isLoading: boolean;
  error: string | null;
  content: unknown;
}

const initialState: LeaderBoardState = {
  isLoading: false,
  error: null,
  content: null,
};

const leaderBoardSlice = createSlice({
  name: 'leaderBoard',
  initialState,
  reducers: {
    getLeaderBoard: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getLeaderBoardSuccess: (state, action: PayloadAction<unknown>) => {
      state.isLoading = false;
      state.content = action.payload;
    },
    getLeaderBoardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { getLeaderBoard, getLeaderBoardSuccess, getLeaderBoardFailure } =
  leaderBoardSlice.actions;

export default leaderBoardSlice.reducer;
