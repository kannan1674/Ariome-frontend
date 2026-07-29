import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import homeReducer from './features/auth/homeSlice';
import authReducer from './features/auth/authSlice';
import offlineReducer from './features/auth/offlineSlice';
import eventRegisterReducer from './features/auth/eventRegisterSlice';
import leaderBoardReducer from './features/auth/leaderBoardSlice';
import membershipReducer from './features/auth/membershipSlice';
import cookooWallReducer from './features/auth/CookooWallSlice';
export const store = configureStore({
  reducer: {
    // Add your reducers here
    homeState: homeReducer,
    authState: authReducer,
    offlineState: offlineReducer,
    eventRegisterState: eventRegisterReducer,
    leaderBoardState: leaderBoardReducer,
    membershipState: membershipReducer,
    cookooWallState: cookooWallReducer,
    // user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['offlineState.error'], // Allow non-serializable error objects
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
