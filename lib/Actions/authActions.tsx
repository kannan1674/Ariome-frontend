import { clientApiCallWithoutToken, clientApiCallWithToken, resetCsrfToken } from '@/lib/clientApi'; // getProfileInfoWithSecurity removed - unused
import { setCookie, getCookie } from '@/lib/utils/cookieUtils';
import {
  initSessionAfterLogin,
  clearSessionStorage,
  refreshAccessToken,
} from '@/lib/auth/sessionManager';
import type { SessionMeta } from '@/lib/auth/sessionTypes';
import {
loginRequest,
loginSuccess,
loginFailure,
logout as logoutAction,
updateSessionTokens,
// clearError removed - unused
forgotPasswordRequest,
forgotPasswordSuccess,
forgotPasswordFailure,
verifyEmailRequest,
verifyEmailSuccess,
verifyEmailFailure,
getProfileInfoRequest,
getProfileInfoSuccess,
getProfileInfoFailure,
updateProfileRequest,
updateProfileSuccess,
updateProfileFailure,
profileChangePasswordRequest,
profileChangePasswordSuccess,
profileChangePasswordFailure,
resendOTPRequest,
resendOTPSuccess,
resendOTPFailure,
MobileCountryCodeRequest,
MobileCountryCodeSuccess,
MobileCountryCodeFailure,
registerRequest,
registerSuccess,
registerFailure,
verifyOtpRequest,
verifyOtpSuccess,
verifyOtpFailure,
resetPasswordRequest,
resetPasswordSuccess,
resetPasswordFailure,
} from '@/lib/features/auth/authSlice';



//import { GenderRequest, GenderSuccess, GenderFailure, setGenderData, BloodGroupRequest, BloodGroupSuccess, BloodGroupFailure, setBloodGroupData, RelationshipRequest, RelationshipSuccess, RelationshipFailure, setRelationshipData, CountryRequest, CountrySuccess, CountryFailure, setCountryData, StateRequest, StateSuccess, StateFailure, setStateData, CitiesRequest, CitiesSuccess, CitiesFailure, setCitieData } from '@/lib/features/auth/offlineSlice';



interface AppDispatch {
  (action: unknown): unknown;
}

// Type definitions for API responses
interface LoginResponse {
  Content: {
    ClubRoleId: number;
    Token: string;
    ExpiresIn: number;
    IsVerified: boolean;
    ProfileVerificationId: string | null;
    RefreshToken: string;
    SessionId?: string;
    Session?: SessionMeta;
    accountTypeId?: number;
    AccountTypeId?: number;
    /** Present when logging in via Express JWT `/api/auth/login` (proxied). */
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: 'user' | 'teacher' | 'admin';
  };
  HttpResponse: {
    Message: string;
    StatusCode?: number;
  };
}

function createSessionRefreshHandler(dispatch: AppDispatch) {
  return async () => {
    const token = getCookie('authToken');
    const refreshToken = getCookie('refreshToken');
    const sessionRaw = getCookie('sessionInfo');
    let session: SessionMeta | undefined;
    if (sessionRaw) {
      try {
        session = JSON.parse(sessionRaw) as SessionMeta;
      } catch {
        session = undefined;
      }
    }
    if (token) {
      dispatch(
        updateSessionTokens({
          token,
          refreshToken: refreshToken || undefined,
          session,
        }),
      );
    }
    return Boolean(token);
  };
}

function buildLoginIdentifier(username: string, countryCallingCodeDigits: string): string {
  const raw = String(username || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) {
    return raw.toLowerCase();
  }
  const mobileDigits = raw.replace(/\D/g, '');
  const cc = String(countryCallingCodeDigits || '').replace(/\D/g, '') || '91';
  return cc && mobileDigits ? `${cc}${mobileDigits}` : mobileDigits;
}

interface ApiResponse {
  Content: unknown;
  HttpResponse: {
    Message: string;
    StatusCode?: number;
    Content?: unknown;
  };
  Message?: string;
}
// interface RegisterResponse {
//   Content: {
//     VerificationId?: string;
//   } | string;
//   HttpResponse: {
//     Message: string;
//     StatusCode?: number;
//   };
// } // Unused - commented out

interface ApiResponse {
  Content: unknown;
  HttpResponse: {
    Message: string;
    StatusCode?: number;
    Content?: unknown;
  };
  Message?: string;
}

// interface RefreshTokenResponse {
//   Content: {
//     Token: string;
//     RefreshToken: string;
//     ExpiresIn?: number;
//     SessionId?: string;
//   };
//   HttpResponse: {
//     Message: string;
//     StatusCode?: number;
//   };
// } // Unused - commented out

// interface ForgotPasswordResponse {
//   Content: {
//     ForgotPasswordId: string;
//   };
// } // Unused - commented out

interface ForgotPasswordSuccessResponse {
  Content?: unknown;
  HttpResponse?: {
    Message?: string;
    StatusCode?: number;
  };
  message?: string;
}

interface VerifyEmailSuccessResponse {
  Content: {
    VerifyEmailId: string;
  };
}


export const login = (data: {
  Username: string;
  password: string;
  MobileNumberCcId: string;
  MobileNumberCc: string;
  fingerprint: string;
  ClubId?: string;
  rClubId?: string;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loginRequest());

      const identifier = buildLoginIdentifier(data.Username, data.MobileNumberCc);
      if (!identifier) {
        const errorMessage = 'Enter a valid email or mobile number';
        dispatch(loginFailure(errorMessage));
        return { error: errorMessage };
      }

      const requestData = {
        identifier,
        password: data.password,
      };

      // Use the new common API function with timeout
      const response = await Promise.race([
        clientApiCallWithoutToken('/auth/signin', requestData),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Login request timeout')), 30000),
        ),
      ]);

      if (!response.ok) {
        const errorMessage = response.error || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { error: errorMessage };
      }

      const responseData = response.data as LoginResponse;

      if (responseData.HttpResponse?.StatusCode && responseData.HttpResponse.StatusCode !== 200) {
        const errorMessage = responseData.HttpResponse.Message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { error: errorMessage, HttpResponse: responseData.HttpResponse };
      }

      const c = responseData.Content;
      const displayName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
      const userData = {
        id: c.id ? String(c.id) : `user-${Date.now()}`,
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        name: displayName || c.email || c.phone || data.Username,
        email: c.email || (data.Username.includes('@') ? data.Username.trim().toLowerCase() : ''),
        token: c.Token,
        refreshToken: c.RefreshToken || '',
        expiresIn: c.ExpiresIn,
        roleId: c.ClubRoleId,
        sessionId: c.SessionId || '',
        session: c.Session,
        accountTypeId: c.accountTypeId ?? c.AccountTypeId ?? 1,
        emailVerified: c.IsVerified ?? false,
        profileVerificationId: c.ProfileVerificationId,
        PhoneNumber: c.phone,
        role: c.role || (c.accountTypeId === 3 ? 'admin' : c.accountTypeId === 2 ? 'teacher' : 'user'),
      };

      dispatch(loginSuccess(userData));
      resetCsrfToken();

      const onRefresh = createSessionRefreshHandler(dispatch);
      initSessionAfterLogin(c.Session, onRefresh);

      // After successful login, fetch profile info
      try {
        dispatch(getProfileInfo());
      } catch (fetchError) {
        console.error('Failed to fetch profile info after login:', fetchError);
        // Don't fail the login if profile fetch fails
      }
      
      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch(loginFailure(errorMessage));
      // Do NOT throw! Just return an error object
      return { error: errorMessage };
    }
  };
};

/** Google Identity Services JWT → same legacy login shape as email/password via `/api/auth/google`. */
export const loginWithGoogle = (idToken: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loginRequest());

      const token = String(idToken || '').trim();
      if (!token) {
        const errorMessage = 'Missing Google credential';
        dispatch(loginFailure(errorMessage));
        return { error: errorMessage };
      }

      const response = await Promise.race([
        clientApiCallWithoutToken('/auth/google', { idToken: token }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Google sign-in timeout')), 15000),
        ),
      ]);

      if (!response.ok) {
        const errorMessage = response.error || 'Google sign-in failed';
        dispatch(loginFailure(errorMessage));
        return { error: errorMessage };
      }

      const responseData = response.data as LoginResponse;

      if (responseData.HttpResponse?.StatusCode && responseData.HttpResponse.StatusCode !== 200) {
        const errorMessage = responseData.HttpResponse.Message || 'Google sign-in failed';
        dispatch(loginFailure(errorMessage));
        return { error: errorMessage, HttpResponse: responseData.HttpResponse };
      }

      const c = responseData.Content;
      const displayName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
      const userData = {
        id: c.id ? String(c.id) : `user-${Date.now()}`,
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        name: displayName || c.email || c.phone || 'Google user',
        email: c.email || '',
        token: c.Token,
        refreshToken: c.RefreshToken || '',
        expiresIn: c.ExpiresIn,
        roleId: c.ClubRoleId,
        sessionId: c.SessionId || '',
        session: c.Session,
        accountTypeId: c.accountTypeId ?? c.AccountTypeId ?? 1,
        emailVerified: c.IsVerified ?? false,
        profileVerificationId: c.ProfileVerificationId,
        PhoneNumber: c.phone,
        role: c.role || (c.accountTypeId === 3 ? 'admin' : c.accountTypeId === 2 ? 'teacher' : 'user'),
      };

      dispatch(loginSuccess(userData));
      resetCsrfToken();

      const onRefresh = createSessionRefreshHandler(dispatch);
      initSessionAfterLogin(c.Session, onRefresh);

      try {
        dispatch(getProfileInfo());
      } catch (fetchError) {
        console.error('Failed to fetch profile info after Google login:', fetchError);
      }

      return responseData;
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Google sign-in failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(loginFailure(errorMessage));
      return { error: errorMessage };
    }
  };
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
};

export const register = (data: RegisterPayload) => {
  return async (dispatch: AppDispatch) => {
    dispatch(registerRequest());  
    try {
      const response = await clientApiCallWithoutToken('/auth/signup', data, 'POST');
      console.log('[register action] response', response);
      if (!response.ok) {
        const errorMessage = response.error || 'Register failed';
        dispatch(registerFailure(errorMessage));
        throw new Error(errorMessage);
      }
      const responseData = response.data as ApiResponse;
      console.log('[register action] success payload', responseData);
      dispatch(registerSuccess(responseData));
      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Register failed';
      console.error('Register error:', error);
      dispatch(registerFailure(errorMessage));
      return { error: errorMessage };
    }
  };
};


export const forgotPassword = (data: {
      email: string;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(forgotPasswordRequest());

      const requestData = {
        email: String(data.email).trim().toLowerCase(),
      };

      const response = await clientApiCallWithoutToken('/auth/forgot-password', requestData);

      if (!response.ok) {
        return { error: response.error || 'Forgot password failed' };
      }

      const responseData = response.data as ForgotPasswordSuccessResponse;
      dispatch(forgotPasswordSuccess(responseData));
      return responseData;
    } catch (error) {
      console.error('Forgot password error:', error);
      dispatch(forgotPasswordFailure(error as string));
      return { error: error as string };
    };
    }
};

export const resetPassword = (data: {
  email: string;
  newPassword: string;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(resetPasswordRequest());

      const requestData = {
        email: String(data.email).trim().toLowerCase(),
        newPassword: data.newPassword,
      };

      const response = await clientApiCallWithoutToken('/auth/reset-password', requestData);

      if (!response.ok) {
        return { error: response.error || 'Reset password failed' };
      }

      const responseData = response.data as ApiResponse;
      dispatch(resetPasswordSuccess(responseData));
      return responseData;
    } catch (error) {
      console.error('Reset password error:', error);
      dispatch(resetPasswordFailure(error as string));
      return { error: error as string };
    }
  };
};

export const verifyForgotPasswordOtp = (data: {
  email: string;
  otp: string;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(verifyOtpRequest());

      const requestData = {
        email: String(data.email).trim().toLowerCase(),
        otp: String(data.otp).trim(),
      };

      const response = await clientApiCallWithoutToken('/auth/verify-reset-password-otp', requestData);

      if (!response.ok) {
        dispatch(verifyOtpFailure(response.error || 'OTP verification failed'));
        return { error: response.error || 'OTP verification failed' };
      }

      const responseData = response.data as ApiResponse;
      dispatch(verifyOtpSuccess(responseData));
      return responseData;
    } catch (error) {
      console.error('OTP verification error:', error);
      dispatch(verifyOtpFailure(error as string));
      return { error: error as string };
    }
  };
};

export const verifyEmail = (data: { email: string; otp: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(verifyEmailRequest());

      const requestData = {
        email: String(data.email).trim().toLowerCase(),
        otp: String(data.otp).trim(),
      };

      const response = await clientApiCallWithoutToken('/auth/verify-email-otp', requestData, 'POST');

      if (!response.ok) {
        return { error: response.error || 'Verify email failed' };
      }

      const responseData = response.data as VerifyEmailSuccessResponse;
      dispatch(verifyEmailSuccess(responseData));
      return responseData;
    } catch (error) {
      console.error('Verify email error:', error);
      dispatch(verifyEmailFailure(error as string));
      return { error: error as string };
    }
  };
};

export const verifyOtp = (data: {
  OTP: string;
  ForgotPasswordId: string;
  rForgotPasswordId: number;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(verifyEmailRequest());

      const requestData = {
        ForgotPasswordId: data.ForgotPasswordId,
        rForgotPasswordId: 0,
        OTP: data.OTP,
      };

      const response = await clientApiCallWithoutToken('/auth/forgot-password-verification', requestData);

      if (!response.ok) {
        return { error: response.error || 'Verify email failed' };
      }

      const responseData = response.data as VerifyEmailSuccessResponse;
      dispatch(verifyEmailSuccess(responseData));
      return responseData;
    } catch (error) {
      console.error('Verify email error:', error);
      dispatch(verifyEmailFailure(error as string));
      return { error: error as string };
    }
  };
};


function isProfileAuthError(status: number, message?: string): boolean {
  const err = String(message || '');
  return (
    status === 401 ||
    status === 403 ||
    err.includes('Authorization token required') ||
    err.includes('Invalid token') ||
    err.includes('Session not found') ||
    err.includes('Session missing')
  );
}

export const getProfileInfo = () => {
  return async (dispatch: AppDispatch, getState: () => any) => {
    try {
      // Get token from Redux store first, then fallback to cookies
      const state = getState();
      let token =
        (state.authState?.user?.token as string | null | undefined) ||
        (state.authState?.token as string | null | undefined);

      // If token not in Redux store, try to get it from cookies
      if (!token) {
        const { getCookie } = await import('@/lib/utils/cookieUtils');
        token = getCookie('authToken');
      }

      const trimmed = typeof token === 'string' ? token.trim() : '';
      const hasBearerToken =
        trimmed.length > 0 &&
        trimmed.toLowerCase() !== 'undefined' &&
        trimmed.toLowerCase() !== 'null';

      if (!hasBearerToken) {
        return null;
      }

      dispatch(getProfileInfoRequest());

      const response = await clientApiCallWithToken(
        '/auth/Profile/Profile-info',
        trimmed,
        undefined,
        'GET',
      );

      if (!response.ok) {
        if (isProfileAuthError(response.status, response.error)) {
          return { unauthenticated: true, error: response.error };
        }

        console.error('Profile API error:', response.error);

        if (response.error?.includes('Unable to connect')) {
          return { error: 'Unable to load profile. Please check your internet connection and try again.' };
        } else if (response.error?.includes('Server configuration error')) {
          return { error: 'Service temporarily unavailable. Please try again later.' };
        } else if (response.error?.includes('Invalid CSRF token')) {
          return { error: 'Session expired. Please refresh the page and try again.' };
        } else {
          return { error: response.error || 'Failed to fetch profile' };
        }
      }
      
      dispatch(getProfileInfoSuccess(response.data as ApiResponse));
      return response.data;
    } catch (error) {
      let errorMessage = 'Get profile info failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('getProfileInfo error:', error);
      dispatch(getProfileInfoFailure(errorMessage));
      return { error: errorMessage };
    }
  }
}

export const logout = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getCookie('authToken');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
    } catch {
      // proceed with local cleanup
    }

    clearSessionStorage();
    dispatch(logoutAction());

    const { clearEventInfo } = await import('@/lib/features/auth/homeSlice');
    dispatch(clearEventInfo());

    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  };
};

export { refreshAccessToken };

export const updateProfile = (data: {
  FirstName: string;
  LastName: string;
  DisplayName: string;
  GenderId?: string;
  BloodGroupId?: string;
  Dob: string;
  Address: string;
  City: string;
  CityId: string;
  State: string;
  StateId: string;
  Country: string;
  CountryId: string;
  Pincode: string;
}) => {
  return async (dispatch: AppDispatch) => {
    try {

      dispatch(updateProfileRequest());

      // Use API client that relies on secure HTTP-only cookies for authentication
      const response = await clientApiCallWithoutToken('/auth/Profile/Edit-Profile', data, 'PUT');





      if (!response.ok) {
        if (response.status === 401 || response.error?.includes('Authorization token required')) {
          console.warn('Update profile API warning:', response.error);
          return { error: 'Please log in to update your profile' };
        }

       
        if (response.error?.includes('Unable to connect')) {
          return { error: 'Unable to update profile. Please check your internet connection and try again.' };
        } else if (response.error?.includes('Server configuration error')) {
          return { error: 'Service temporarily unavailable. Please try again later.' };
        } else if (response.error?.includes('Invalid CSRF token')) {
          return { error: 'Session expired. Please Login again.' };
        } else {
          return { error: response.error || 'Failed to update profile' };
        }
      }
      
      dispatch(updateProfileSuccess(response.data as ApiResponse));
      return response.data;
    } catch (error) {
      let errorMessage = 'Update profile failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('updateProfile error:', error);
      dispatch(updateProfileFailure(errorMessage));
      return { error: errorMessage };
    }
  }
}



// Change Password Action
export const getProfileChangePassword = (data: {
  "CurrentPassword": string,
  "NewPassword": string,
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(profileChangePasswordRequest());

      // Get the auth token from cookies
      const { getCookie } = await import('@/lib/utils/cookieUtils');
      const authToken = getCookie('authToken');
      
      if (!authToken) {
        console.warn('No auth token found for change password request');
        return { error: 'Please log in to change your password' };
      }

      // Use the proper API client function that includes authentication
      const { clientApiCallWithToken } = await import('@/lib/clientApi');
      const response = await clientApiCallWithToken('/auth/Profile/Change-Password', authToken, data, 'PUT');
      
      if (!response.ok) {
        if (response.error?.includes('Authorization token required')) {
          console.warn('Change password API warning:', response.error);
          // Handle session expiry

   
          return { error: 'Please log in to change your password' };
        }

        console.error('Change password API error:', response.error);

        if (response.error?.includes('Unable to connect')) {
          return { error: 'Unable to change password. Please check your internet connection and try again.' };
        } else if (response.error?.includes('Server configuration error')) {
          return { error: 'Service temporarily unavailable. Please try again later.' };
        } else if (response.error?.includes('Invalid CSRF token')) {
          return { error: 'Session expired. Please refresh the page and try again.' };
        } else {
          return { error: response.error || 'Failed to change password' };
        }
      }
      
      const responseData = response.data as ApiResponse;
      if (responseData.HttpResponse?.StatusCode === 200) {
        dispatch(profileChangePasswordSuccess());
        return responseData;
      } else {
        return { error: responseData.HttpResponse?.Message || 'Change password failed' };
      }

    } catch (error) {
      let errorMessage = 'Change password failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(profileChangePasswordFailure(errorMessage));
      return { error: errorMessage };
    }
  }
}

export const resendOTP = (forgotPasswordId: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(resendOTPRequest());

      const requestData = {
        rForgotPasswordId: 0,
        ForgotPasswordId: forgotPasswordId,
      };
      

      const response = await clientApiCallWithoutToken('/auth/Otp-resend', requestData);
   

      if (!response.ok) {
        throw new Error(response.error || '');
      }

      const responseData = response.data as ApiResponse;
   
      
      // Since the server already validated the response.ok, we can proceed
      // The backend response structure might not have HttpResponse.StatusCode
      if (responseData.HttpResponse && responseData.HttpResponse.StatusCode && responseData.HttpResponse.StatusCode !== 200) {
        throw new Error(responseData.HttpResponse.Message || '');
      }
      
      // If we reach here, the resend was successful

      dispatch(resendOTPSuccess(responseData));
      return responseData;
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(resendOTPFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }
}

const DEFAULT_MOBILE_DIAL_CODES = [
  { Id: 'IN', Country: 'India', CountryCode: 'IN', Code: '91', DialDisplay: '+91', iso2: 'IN', dialCode: '+91', name: 'India' },
  { Id: 'US', Country: 'United States', CountryCode: 'US', Code: '1', DialDisplay: '+1', iso2: 'US', dialCode: '+1', name: 'United States' },
  { Id: 'GB', Country: 'United Kingdom', CountryCode: 'GB', Code: '44', DialDisplay: '+44', iso2: 'GB', dialCode: '+44', name: 'United Kingdom' },
];

export const getMobileCountryCode = () => async (dispatch: AppDispatch) => {
  dispatch(MobileCountryCodeRequest());
  try {
      const response = await Promise.race([
          clientApiCallWithoutToken('/auth/MobileCountyCode', undefined, 'GET'),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Mobile country code request timeout')), 30000),
          ),
        ]);

      if (!response.ok) {
          throw new Error(response.error || `HTTP error! status: ${response.status}`);
      }

      const data = response.data as { HttpResponse?: unknown; Content?: unknown[] };
      const content = Array.isArray(data.Content) && data.Content.length > 0
        ? data.Content
        : DEFAULT_MOBILE_DIAL_CODES;

      dispatch(MobileCountryCodeSuccess({
        HttpResponse: data.HttpResponse ?? { Message: 'OK', StatusCode: 200 },
        Content: content,
      }));
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[getMobileCountryCode]', errorMessage, '— using defaults');
      }
      dispatch(MobileCountryCodeSuccess({
        HttpResponse: { Message: 'OK', StatusCode: 200 },
        Content: DEFAULT_MOBILE_DIAL_CODES,
      }));
  }
}

// export const getGender = () => async (dispatch: AppDispatch) => {
//   dispatch(GenderRequest());
//   try {
//       // Call our Next.js API route which will handle the backend call
//       const response = await Promise.race([
//           clientApiCallWithoutToken('/auth/gender', undefined, 'GET'),
//           new Promise<never>((_, reject) => 
//             setTimeout(() => reject(new Error('Gender request timeout')), 15000)
//           )
//         ]);
  

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = response.data as any;
      
//       // Map API response to Redux state format
//       const genderData = data.Content?.map((item: any) => ({
//           id: item.Id,
//           name: item.Name
//       })) || [];

      
//       dispatch(setGenderData(genderData));
//       dispatch(GenderSuccess({} as any)); // Empty success payload
//   } catch (error) {
//       // Convert error to serializable string
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       dispatch(GenderFailure(errorMessage));
//   }
// }

// export const getBloodGroup = () => async (dispatch: AppDispatch) => {
//   dispatch(BloodGroupRequest());
//   try {
//       const response = await Promise.race([
//           clientApiCallWithoutToken('/auth/BloodGroup', undefined, 'GET'),
//           new Promise<never>((_, reject) => 
//               setTimeout(() => reject(new Error('Blood group request timeout')), 15000)
//           )
//       ]);

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = response.data as any;
      
//       // Map API response to Redux state format
//       const bloodGroupData = data.Content?.map((item: any) => ({
//           id: item.Id,
//           name: item.Name
//       })) || [];
      
//       dispatch(setBloodGroupData(bloodGroupData));
//       dispatch(BloodGroupSuccess({} as any)); // Empty success payload
//   } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       dispatch(BloodGroupFailure(errorMessage));
//   }
// }

// export const getRelationship = () => async (dispatch: AppDispatch) => {
//   dispatch(RelationshipRequest());
//   try {
//       const response = await Promise.race([
//           clientApiCallWithoutToken('/auth/Relationship', undefined, 'GET'),
//           new Promise<never>((_, reject) => 
//               setTimeout(() => reject(new Error('Relationship request timeout')), 15000)
//           )
//       ]);

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = response.data as any;
      
//       // Map API response to Redux state format
//       const relationshipData = data.Content?.map((item: any) => ({
//           id: item.Id,
//           name: item.Name
//       })) || [];
      
//       dispatch(setRelationshipData(relationshipData));
//       dispatch(RelationshipSuccess({} as any)); // Empty success payload
//   } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       dispatch(RelationshipFailure(errorMessage));
//   }
// }

// export const getCountry = () => async (dispatch: AppDispatch) => {
//   dispatch(CountryRequest());
//   try {
//       const response = await Promise.race([
//           clientApiCallWithoutToken('/auth/Country', undefined, 'GET'),
//           new Promise<never>((_, reject) => 
//               setTimeout(() => reject(new Error('Country request timeout')), 15000)
//           )
//       ]);

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = response.data as any;
      
//      // Support multiple possible API response shapes for country list
//      const content = data?.Content ?? data?.content ?? [];
//      const countrySource = Array.isArray(content?.Countries)
//          ? content.Countries
//          : Array.isArray(content?.Country)
//              ? content.Country
//              : Array.isArray(content)
//                  ? content
//                  : [];
//                   const countryData = countrySource.map((item: any) => ({
//                   id: item.Id ?? item.id ?? item.CountryId ?? item.countryId ?? '',
//                   name: item.Name ?? item.name ?? item.CountryName ?? item.countryName ?? 'Unknown'
//               })).filter((item: any) => item.id !== '');
      
//       dispatch(setCountryData(countryData));
//       dispatch(CountrySuccess({} as any)); // Empty success payload
//   } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       dispatch(CountryFailure(errorMessage));
//   }
// }

// export const getState = (countryId: string) => async (dispatch: AppDispatch) => {
//   dispatch(StateRequest());
//   try {
//       const response = await Promise.race([
//           clientApiCallWithoutToken(`/auth/state?countryId=${encodeURIComponent(countryId)}`, undefined, 'GET'),
//           new Promise<never>((_, reject) => 
//               setTimeout(() => reject(new Error('State request timeout')), 15000)
//           )
//       ]);

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = response.data as any;
      
//       // Support multiple possible API response shapes for state list
//       const content = data?.Content ?? data?.content ?? [];
//       const stateSource = Array.isArray(content?.States)
//           ? content.States
//           : Array.isArray(content?.State)
//               ? content.State
//               : Array.isArray(content)
//                   ? content
//                   : [];
//       const stateData = stateSource.map((item: any) => ({
//           id: item.Id ?? item.id ?? item.StateId ?? item.stateId ?? '',
//           name: item.Name ?? item.name ?? item.StateName ?? item.stateName ?? 'Unknown'
//       })).filter((item: any) => item.id !== '');
      
//       dispatch(setStateData(stateData));
//       dispatch(StateSuccess({} as any)); // Empty success payload
//   } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       dispatch(StateFailure(errorMessage));
//   }
// }

// export const getCities = (stateId: string) => async (dispatch: AppDispatch) => {
//   dispatch(CitiesRequest());
//   try {
//       const response = await Promise.race([
//           clientApiCallWithoutToken(`/auth/Cities?stateId=${encodeURIComponent(stateId)}`, undefined, 'GET'),
//           new Promise<never>((_, reject) => 
//               setTimeout(() => reject(new Error('Cities request timeout')), 15000)
//           )
//       ]);

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = response.data as any;
      
//       // Map API response to Redux state format
//       const content = data?.Content ?? data?.content ?? [];
//       const citySource = Array.isArray(content?.Cities)
//           ? content.Cities
//           : Array.isArray(content?.City)
//               ? content.City
//               : Array.isArray(content)
//                   ? content
//                   : [];
//       const citiesData = citySource.map((item: any) => ({
//           id: item.Id ?? item.id ?? item.CityId ?? item.cityId ?? '',
//           name: item.Name ?? item.name ?? item.CityName ?? item.cityName ?? 'Unknown'
//       })).filter((item: any) => item.id !== '');
      
//       dispatch(setCitieData(citiesData));
//       dispatch(CitiesSuccess({} as any)); // Empty success payload
//   } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       dispatch(CitiesFailure(errorMessage));
//   }
// }

