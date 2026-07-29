import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventRegisterState {
  isLoading: boolean;
  error: string | null;
  content: unknown;
}

const initialState: EventRegisterState = {
  isLoading: false,
  error: null,
  content: null,
};

const eventRegisterSlice = createSlice({
  name: 'eventRegister',
  initialState,
  reducers: {
    getEventRegister: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getEventRegisterSuccess: (state, action: PayloadAction<unknown>) => {
      state.isLoading = false;
      state.content = action.payload;
    },
    getEventRegisterFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { getEventRegister, getEventRegisterSuccess, getEventRegisterFailure } =
  eventRegisterSlice.actions;

export default eventRegisterSlice.reducer;
