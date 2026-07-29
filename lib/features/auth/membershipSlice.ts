import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MembershipState {
  membership: unknown;
  content: unknown;
  isLoading: boolean;
  error: string | null;
}

const initialState: MembershipState = {
  membership: null,
  content: null,
  isLoading: false,
  error: null,
};

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    membershipRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    membershipSuccess: (state, action: PayloadAction<unknown>) => {
      state.isLoading = false;
      state.membership = action.payload;
      state.content = action.payload;
    },
    membershipFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    membershipListRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    membershipListSuccess: (state, action: PayloadAction<unknown>) => {
      state.isLoading = false;
      state.content = action.payload;
    },
    membershipListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  membershipRequest,
  membershipSuccess,
  membershipFailure,
  membershipListRequest,
  membershipListSuccess,
  membershipListFailure,
} = membershipSlice.actions;

export default membershipSlice.reducer;
