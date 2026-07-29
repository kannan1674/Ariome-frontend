import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setCookie, deleteCookie } from '@/lib/utils/cookieUtils';
import { getCookie } from '@/lib/utils/cookieUtils';
import type { SessionMeta } from '@/lib/auth/sessionTypes';

interface User {
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  role?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  roleId?: number;
  sessionId?: string;
  session?: SessionMeta;
  accountTypeId?: number;
  emailVerified?: boolean;
  profileVerificationId?: string | null;
  message?: string | null;
  content?: string | null;
  BloodGroupName?: string;
  Dob?: string;
  City?: string;
  State?: string;
  Country?: string;
  Address?: string;
  ZipCode?: string;
  Pincode?: string;
  PhoneNumber?: string;
  MobileNumber?: string;
  MobileNumberCc?: string;
  MobileNumberCcId?: string;
  Gender?: string;
  GenderId?: string;
  BloodGroupId?: string;
  CountryId?: string;
  StateId?: string;
  CityId?: string;
  StravaAthleteId?: string;
  Membership?: {
    MembershipStatus?: string;
    MembershipReference?: string;
    IsMembershipActive?: boolean;
    PlanStartDate?: string;
    PlanStartDateText?: string;
    PlanEndDate?: string;
    PlanEndDateText?: string;
  };
}

// interface ForgotPasswordSuccessResponse {
//   Content: {
//     ForgotPasswordId: string;
//   };
// } // Unused - commented out

interface VerifyEmailSuccessResponse {
  Content: {
    VerifyEmailId: string;
  };
}

interface ApiResponse {
  Content?: any;
  HttpResponse?: {
    Message?: string;
    StatusCode?: number;
  };
  Message?: string;
  forgotPasswordId?: string;
}

interface AuthState {
  content: any;
  /** Country dial list from GET country-codes; not cleared by register/forgot-password etc. */
  mobileDialCodes: unknown[] | null;
  ClubRoleId: any;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True after initial session/profile bootstrap on app load. */
  sessionBootstrapped: boolean;
  error: string | null;
  message: string | null;
}

const initialState: AuthState = {
  content: null,
  mobileDialCodes: null,
  ClubRoleId: undefined,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sessionBootstrapped: false,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerRequest: (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state: AuthState, action: PayloadAction<ApiResponse>) => {
      state.isLoading = false;
      state.message = action.payload.HttpResponse?.Message || null;
      state.content = action.payload.Content || null;

      try {
        if (action.payload.Content) {
          setCookie('registerPayload', JSON.stringify(action.payload.Content), {
            maxAgeSeconds: 60 * 60 * 2,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to persist register payload:', error);
        }
      }
    },
    registerFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    loginRequest: (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state: AuthState, action: PayloadAction<User>) => {
      const accessMaxAge = action.payload.expiresIn;
      const session = action.payload.session;
      const sessionMaxAge = session?.sessionExpiresInSeconds
        ? session.sessionExpiresInSeconds + 7 * 24 * 3600
        : accessMaxAge;

      if (action.payload.token) {
        setCookie('authToken', action.payload.token, { maxAgeSeconds: accessMaxAge });
      }
      if (action.payload.refreshToken) {
        setCookie('refreshToken', action.payload.refreshToken, { maxAgeSeconds: sessionMaxAge });
      }
      if (action.payload.sessionId) {
        setCookie('sessionId', action.payload.sessionId, { maxAgeSeconds: sessionMaxAge });
      }
      if (accessMaxAge) {
        setCookie('tokenExpiry', String(Date.now() + accessMaxAge * 1000), { maxAgeSeconds: accessMaxAge });
      }
      if (session) {
        setCookie('sessionInfo', JSON.stringify(session), { maxAgeSeconds: sessionMaxAge });
      }
      if (action.payload.role) {
        setCookie('userRole', action.payload.role, { maxAgeSeconds: sessionMaxAge ?? 60 * 60 * 24 * 7 });
      }

      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = { ...state.user, ...action.payload };
      state.error = null;
    },
    setSessionBootstrapped: (state: AuthState, action: PayloadAction<boolean>) => {
      state.sessionBootstrapped = action.payload;
    },
    loginFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    updateSessionTokens: (
      state: AuthState,
      action: PayloadAction<{ token: string; refreshToken?: string; expiresIn?: number; session?: SessionMeta }>,
    ) => {
      const { token, refreshToken, expiresIn, session } = action.payload;
      if (state.user) {
        state.user = {
          ...state.user,
          token,
          ...(refreshToken ? { refreshToken } : {}),
          ...(expiresIn ? { expiresIn } : {}),
          ...(session ? { session } : {}),
        };
      }
      setCookie('authToken', token, { maxAgeSeconds: expiresIn });
      if (refreshToken) {
        setCookie('refreshToken', refreshToken, { maxAgeSeconds: expiresIn });
      }
      if (expiresIn) {
        setCookie('tokenExpiry', String(Date.now() + expiresIn * 1000), { maxAgeSeconds: expiresIn });
      }
      if (session) {
        setCookie('sessionInfo', JSON.stringify(session), { maxAgeSeconds: expiresIn });
      }
    },
    logout: (state: AuthState) => {
      // Clear all authentication cookies
      deleteCookie('authToken');
      deleteCookie('refreshToken');
      deleteCookie('sessionId');
      deleteCookie('tokenExpiry');
      deleteCookie('sessionInfo');
      deleteCookie('userRole');
      
      state.isAuthenticated = false;
      state.user = null;
      state.sessionBootstrapped = false;
      state.error = null;
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
    forgotPasswordRequest: (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state: AuthState, action: PayloadAction<ApiResponse>) => {
 
      
      // Extract forgotPasswordId from response and save to client-accessible cookie
      const forgotPasswordId = (action.payload as any).forgotPasswordId || action.payload.Content;

      
      if (forgotPasswordId !== undefined && forgotPasswordId !== null) {
        // Save forgotPasswordId to client-accessible cookie
        if (typeof window !== 'undefined') {

          
          // Try setting the cookie
          setCookie('forgotPasswordId', String(forgotPasswordId), { maxAgeSeconds: 300 }); // 5 minutes expiry
          
          // Verify the cookie was saved
          const savedValue = getCookie('forgotPasswordId');
          // If cookie failed, try localStorage as fallback
          if (!savedValue) {

            try {
              localStorage.setItem('forgotPasswordId', String(forgotPasswordId));
              localStorage.setItem('forgotPasswordIdExpiry', String(Date.now() + 300000)); // 5 minutes
        
            } catch {
              // Handle localStorage error silently
            }
          }
        }
      } else {
        // No forgotPasswordId available
      }
      
      state.isLoading = false;
    
      if (action.payload.HttpResponse) {
        state.message = action.payload.HttpResponse.Message || null;
      } else {
        state.message = action.payload.Message || null;
      }
    
      state.content = action.payload.Content;
    },
    forgotPasswordFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    verifyEmailRequest: (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
        },
    verifyEmailSuccess: (state: AuthState, _action: PayloadAction<VerifyEmailSuccessResponse>) => {                                                              
      state.isLoading = false;
    },
    verifyEmailFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    getProfileInfoRequest: (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    },
    getProfileInfoSuccess: (state: AuthState, action: PayloadAction<any>) => {
      state.isLoading = false;
      // Update user data if profile info contains user details
      // CRITICAL: Use EXACT API response data - NO FALLBACKS, NO MERGING with old data
      if (action.payload?.Content) {
        const profileData = action.payload.Content;
        
        // Create new user object with ONLY API data - preserve only essential fields from old state
        const newUser = {
          // Preserve authentication-related fields that might not be in profile API
          id: state.user?.id,
          token: state.user?.token,
          refreshToken: state.user?.refreshToken,
          expiresIn: state.user?.expiresIn,
          sessionId: state.user?.sessionId,
          emailVerified: state.user?.emailVerified,
          profileVerificationId: state.user?.profileVerificationId,
          role: profileData.role ?? state.user?.role,
          roleId: state.user?.roleId,
          accountTypeId:
            profileData.role === 'admin'
              ? 3
              : profileData.role === 'teacher'
                ? 2
                : state.user?.accountTypeId ?? 1,
          
          // Use EXACT API response fields - map API field names to user object
          firstName: profileData.FirstName ?? '',
          lastName: profileData.LastName ?? '',
          name: profileData.DisplayName ?? (profileData.FirstName && profileData.LastName ? `${profileData.FirstName} ${profileData.LastName}`.trim() : ''),
          email: profileData.Email ?? '',
          image: profileData.ProfileImage ?? '',
          BloodGroupName: profileData.BloodGroupName ?? '',
          Dob: profileData.Dob ?? '',
          // CRITICAL: Location fields - use EXACT API values
          City: profileData.City ?? '',
          State: profileData.State ?? '',
          Country: profileData.Country ?? '',
          Address: profileData.Address ?? '',
          ZipCode: profileData.ZipCode ?? '',
          Pincode: profileData.Pincode ?? '',
          PhoneNumber: profileData.PhoneNumber ?? profileData.MobileNumber ?? '',
          MobileNumber: profileData.MobileNumber ?? '',
          MobileNumberCc: profileData.MobileNumberCc ?? '',
          MobileNumberCcId: profileData.MobileNumberCcId ?? '',
          Gender: profileData.Gender ?? '',
          GenderId: profileData.GenderId ?? '',
          BloodGroupId: profileData.BloodGroupId ?? '',
          // CRITICAL: Location IDs - use EXACT API values
          CountryId: profileData.CountryId ?? '',
          StateId: profileData.StateId ?? '',
          CityId: profileData.CityId ?? '',
          StravaAthleteId: profileData.StravaAthleteId ?? '',
          Membership: profileData.Membership ?? state.user?.Membership, // Keep membership structure if exists
        };
        
        state.user = newUser;
        if (newUser.role) {
          setCookie('userRole', newUser.role, { maxAgeSeconds: 60 * 60 * 24 * 7 });
        }

        console.log('✅ [Redux] Profile data updated EXACTLY from API:', {
          City: state.user.City,
          CityId: state.user.CityId,
          State: state.user.State,
          StateId: state.user.StateId,
          Country: state.user.Country,
          CountryId: state.user.CountryId,
          FirstName: profileData.FirstName,
          LastName: profileData.LastName,
          DisplayName: profileData.DisplayName,
          fullApiResponse: profileData
        });
      }
    },
    getProfileInfoFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateProfileRequest:(state:AuthState)=>{
      state.error = null;
      state.isLoading = false;
    },
    updateProfileSuccess:(state:AuthState,action:PayloadAction<ApiResponse>)=>{
      state.isLoading = false;
      state.message = action.payload.HttpResponse?.Message || null;
      
      // Update the profile data in the store
      if (action.payload.Content) {
        state.content = action.payload.Content;
        state.content = action.payload.Content;
        
        // Also update user data if it exists
        if (state.user && action.payload.Content) {
          state.user = {
            ...state.user,
            ...action.payload.Content
          };
        }
      }
    },
    updateProfileFailure:(state:AuthState,action:PayloadAction<string>)=>{
      state.isLoading = false;
      state.error = action.payload;
    },
    profileChangePasswordRequest:(state:AuthState)=>{
      state.error = null;
      state.isLoading = true;
    },
    profileChangePasswordSuccess: (state: AuthState) => {
      state.isLoading = false;
    },
    profileChangePasswordFailure:(state:AuthState,action:PayloadAction<string>)=>{
      state.isLoading = false;
      state.error = action.payload;
    },
    resendOTPRequest:(state:AuthState)=>{
      state.error = null;
      state.isLoading = true;
    },
    resendOTPSuccess:(state:AuthState,action:PayloadAction<ApiResponse>)=>{
      state.isLoading = false;
      state.message = action.payload.HttpResponse?.Message || null;
      state.content = action.payload.Content || null;
    },
    resendOTPFailure:(state:AuthState,action:PayloadAction<string>)=>{
      state.isLoading = false;
      state.error = action.payload;
    },
    MobileCountryCodeRequest:(state:AuthState)=>{
      // Do not toggle global isLoading — that remounts profile/edit UI and causes request storms.
      state.error = null;
    },
    MobileCountryCodeSuccess:(state:AuthState,action:PayloadAction<ApiResponse>)=>{
      state.message = action.payload.HttpResponse?.Message || null;
      const c = action.payload.Content;
      if (Array.isArray(c)) {
        state.mobileDialCodes = c;
        state.content = c;
      } else {
        state.content = action.payload.Content ?? null;
      }
    },
    MobileCountryCodeFailure:(state:AuthState,action:PayloadAction<string>)=>{
      state.error = action.payload;
    },
  verifyOtpRequest:(state:AuthState)=>{
    state.isLoading = true;
    state.error = null;
  },
  verifyOtpSuccess:(state:AuthState,action:PayloadAction<ApiResponse>)=>{
    state.isLoading = false;
    state.message = action.payload.HttpResponse?.Message || null;
    state.content = action.payload.Content || null;

    if (action.payload.Content) {
      setCookie('Token', String(action.payload.Content));
    }
  },

  verifyOtpFailure:(state:AuthState,action:PayloadAction<string>)=>{
    state.isLoading = false;
    state.error = action.payload;
  },
    resetPasswordRequest:(state:AuthState)=>{
      state.isLoading = true;
      state.error = null;
    },
    resetPasswordSuccess:(state:AuthState,action:PayloadAction<ApiResponse>)=>{
      state.isLoading = false;
      state.message = action.payload.HttpResponse?.Message || null;
      state.content = action.payload.Content || null;
    },
    resetPasswordFailure:(state:AuthState,action:PayloadAction<string>)=>{
      state.isLoading = false;
      state.error = action.payload;
    },
  },
    
});

export const { loginRequest, loginSuccess, loginFailure, logout, updateSessionTokens, setSessionBootstrapped, clearError,
   forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure, verifyEmailRequest,
    verifyEmailSuccess, verifyEmailFailure, getProfileInfoRequest, getProfileInfoSuccess,
     getProfileInfoFailure,
      updateProfileRequest, updateProfileSuccess, updateProfileFailure,
      registerRequest, registerSuccess, registerFailure,
      resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure,
       profileChangePasswordRequest, profileChangePasswordSuccess, profileChangePasswordFailure,
        resendOTPRequest, resendOTPSuccess, resendOTPFailure, MobileCountryCodeRequest, MobileCountryCodeSuccess, MobileCountryCodeFailure, verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure } = authSlice.actions;
export default authSlice.reducer;
