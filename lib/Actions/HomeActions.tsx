import { AppDispatch } from "../store";
import { getEvents, getEventsSuccess, appendEventsSuccess, getEventsFailure,
    getEventInfo, getEventInfoSuccess, getEventInfoFailure,
    signinHome, signinHomeSuccess, signinHomeFailure, setLoadingComplete,
    siginHomeInfo, siginHomeInfoSuccess, siginHomeInfoFailure, clearEventInfo, getMyEventsRequest, getMyEventsSuccess, getMyEventsFailure,
    getMyEventsDetailsRequest, getMyEventsDetailsSuccess, getMyEventsDetailsFailure
 } from "../features/auth/homeSlice";
import { clientApiCallWithoutToken, clientApiCallWithToken } from "../clientApi";
import { getCookie } from "../utils/cookieUtils";

/** True if `/auth/Starva-Authorize` (or similar) payload indicates Strava is already linked. */
export function isAthleteStravaAuthorized(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  const c = d.Content as Record<string, unknown> | undefined;
  if (c && c.IsAuthorized === true) return true;
  if (d.IsAuthorized === true) return true;
  return false;
}

export const eventsGet = (params?: {
    PageNo?: number;
    PageSize?: number;
    Keyword?: string;
    Type?: 'ongoing' | 'upcoming' | 'past' | string;
    ClubId?: string;
    append?: boolean; // If true, append events instead of replacing
}) => async (dispatch: AppDispatch) => {
    if (!params?.append) {
        dispatch(getEvents());
    }
    try {
        const requestBody = {
            PageNo: params?.PageNo ?? 1,
            PageSize: params?.PageSize ?? 10,
            Keyword: params?.Keyword ?? '',
            Type: params?.Type ?? '',
            ClubId: params?.ClubId ?? ''
        };
        const response = await clientApiCallWithoutToken('/auth/Home', requestBody, 'POST');
        
        // Handle empty response
        if (!response.data) {
            console.warn('⚠️ [HomeActions] Empty response received, dispatching empty events');
            dispatch(getEventsSuccess({ events: [], type: params?.Type || '' }));
            return;
        }

        if (response.ok) {
            const data = response.data as any;
          
            // Handle case where response has error structure but ok is true
            if (data?.error && data.error === 'Empty response from server') {
                console.warn('⚠️ [HomeActions] Empty response from server, returning empty events');
                dispatch(getEventsSuccess({ events: [], type: params?.Type || '' }));
                    return;
                }
          
            const rawEvents = data?.Content?.PublicHomeEventListRecords || data?.events || data?.Content?.events || [];
            
            // Get the type from params
            const eventType = params?.Type || '';
            
            // For append calls with no events, still store empty array to maintain state structure
            // This ensures we know which types have been fetched
            
            // Map API response fields to component-friendly format
            const mappedEvents = rawEvents.map((event: any, index: number) => {
                // Ensure image path is properly set
                const imagePath = event.ImagePath || event.image || '';
                const imageUrl = imagePath.startsWith('http') ? imagePath : (imagePath ? imagePath : '');
                
                return {
                    ...event,
                    id: event.id || index + 1, // Use index if no id
                    title: event.title || event.Name || 'Event',
                    image: imageUrl, // Use mapped image
                    ImagePath: imagePath, // Keep original for reference
                    location: event.location || event.Location || '',
                    apiId: event.apiId || event.Id || '',
                    isVirtual: event.isVirtual !== undefined ? event.isVirtual : (event.IsVirtual || false),
                    isFree: event.isFree !== undefined ? event.isFree : (event.HasFreeCategory || false),
                    StartDateText: event.StartDateText || event.StartDateString || '',
                    EndDateText: event.EndDateText || event.EndDateString || '',
                    RegistrationStartDateText: event.RegistrationStartDateText || event.RegistrationStartDateString || '',
                    RegistrationEndDateText: event.RegistrationEndDateText || event.RegistrationEndDateString || '',
                };
            });
            
            // Use appendEventsSuccess if append is true, otherwise use getEventsSuccess
            if (params?.append) {
                // Always dispatch to store events by type (even if empty)
                dispatch(appendEventsSuccess({ events: mappedEvents, type: eventType }));
            } else {
                // For the first call, always set events (even if empty) to initialize state
                dispatch(getEventsSuccess({ events: mappedEvents, type: eventType }));
            }
        } else {
            // Extract error message from response data if available
            const errorMessage = (response.data as any)?.HttpResponse?.Message || response.error || 'Failed to load events';
            dispatch(getEventsFailure(errorMessage));
        }
    } catch (error) {
        dispatch(getEventsFailure(error as string));
    }
}

export const eventInfoGet = (eventId: string, clubId?: string) => async (dispatch: AppDispatch) => {
    dispatch(getEventInfo());
    try {
        // Use the correct endpoint - /auth/Home (not /auth/Home/event-info)
        const queryParams = new URLSearchParams();
        if (eventId) queryParams.append('eventId', eventId);
        // Always include clubId if provided (even if empty string, the backend will use default)
        if (clubId !== undefined && clubId !== null) {
            queryParams.append('clubId', clubId);
        }
        const queryString = queryParams.toString();
        const endpoint = `/auth/Home${queryString ? `?${queryString}` : ''}`;
        
        const response = await clientApiCallWithoutToken(endpoint, undefined, 'GET');
    
        if (response.ok) {
            const data = response.data as any;
            // If StatusCode is 200, even with "no event info available" message, it's a valid response (not an error)
            // Check if the message indicates no event info available
            const responseMessage = data?.HttpResponse?.Message || '';
            const hasNoEventInfoMessage = responseMessage.toLowerCase().includes('no event info available') || 
                                         responseMessage.toLowerCase().includes('there is no event info available');
            
            // Don't store event info if it's a "no event info available" message
            if (hasNoEventInfoMessage && (!data?.Content || Object.keys(data.Content).length === 0)) {
                // Clear event info instead of storing the "no event info" response
                dispatch(clearEventInfo());
                return;
            }
            
            if (data?.HttpResponse?.StatusCode && data.HttpResponse.StatusCode !== 200) {
                // Don't treat "no event info available" as an error even if StatusCode is not 200
                // (though typically it should be 200)
                if (!hasNoEventInfoMessage) {
                    console.error('❌ [HomeActions] eventInfoGet - Backend error:', responseMessage);
                    dispatch(getEventInfoFailure(`Backend error: ${responseMessage}`));
                    return;
                }
            }
            
            // Store the full response data (which includes Content)
            dispatch(getEventInfoSuccess({ eventInfo: data }));
        } else {
            // Extract error message from response
            const errorMessage = (response.data as any)?.HttpResponse?.Message || response.error || 'Failed to load event details';
            console.error('❌ [HomeActions] eventInfoGet - Request failed:', errorMessage);
            dispatch(getEventInfoFailure(errorMessage));
        }
    } catch (error) {
        console.error('❌ [HomeActions] eventInfoGet - Exception:', error);
        dispatch(getEventInfoFailure(error instanceof Error ? error.message : 'An unexpected error occurred'));
    }
}

interface SigninHomeParams {
    PageNo?: number;
    PageSize?: number;
    Keyword?: string;
    Type?: 'ongoing' | 'upcoming' | 'past' | string;
   
    append?: boolean;
}

// After signin, fetch events using the secure Signin-Home route
export const signinHomeGet = (params?: SigninHomeParams) => async (dispatch: AppDispatch) => {
    if (!params?.append) {
        dispatch(signinHome());
    }

    try {
        const requestBody = {
            PageNo: params?.PageNo ?? 1,
            PageSize: params?.PageSize ?? 10,
            Keyword: params?.Keyword ?? '',
            Type: params?.Type ?? '',
            
        };

        const response = await clientApiCallWithoutToken('/auth/Signin-Home', requestBody, 'POST');

        if (!response.ok) {
            const errorMessage = (response.data as any)?.HttpResponse?.Message || response.error || 'Failed to load signed-in events';
            // Don't treat "no events available" as an error - just return empty events
            const messageLower = errorMessage.toLowerCase();
            if (messageLower.includes('no events available') || 
                messageLower.includes('there are no events available')) {
                // Return empty events instead of error
                const eventType = params?.Type || '';
                dispatch(getEventsSuccess({ events: [], type: eventType }));
                dispatch(setLoadingComplete());
                return { data: { Content: { HomeEventListRecords: [] } } };
            }
            dispatch(signinHomeFailure(errorMessage));
            return { error: errorMessage };
        }

        const data = response.data as any;

        // Handle backend-reported errors
        if (data?.HttpResponse?.StatusCode && data.HttpResponse.StatusCode !== 200) {
            const message = data.HttpResponse.Message || 'Unknown error';
            if (!message.toLowerCase().includes('no events available') &&
                !message.toLowerCase().includes('there are no events available')) {
                dispatch(signinHomeFailure(`Backend error: ${message}`));
                return { error: message };
            }
        }

        const rawEvents = data?.Content?.HomeEventListRecords
            || data?.Content?.PublicHomeEventListRecords
            || data?.events
            || data?.Content?.events
            || [];
        const eventType = params?.Type || '';

        const mappedEvents = rawEvents.map((event: any, index: number) => {
            const imagePath = event.ImagePath || event.image || '';
            const imageUrl = imagePath.startsWith('http') ? imagePath : (imagePath ? imagePath : '');

            return {
                ...event,
                id: event.id || index + 1,
                title: event.title || event.Name || 'Event',
                image: imageUrl,
                ImagePath: imagePath,
                location: event.location || event.Location || '',
                apiId: event.apiId || event.Id || '',
                isVirtual: event.isVirtual !== undefined ? event.isVirtual : (event.IsVirtual || false),
                isFree: event.isFree !== undefined ? event.isFree : (event.HasFreeCategory || false),
                StartDateText: event.StartDateText || event.StartDateString || '',
                EndDateText: event.EndDateText || event.EndDateString || '',
                RegistrationStartDateText: event.RegistrationStartDateText || event.RegistrationStartDateString || '',
                RegistrationEndDateText: event.RegistrationEndDateText || event.RegistrationEndDateString || '',
            };
        });

        if (params?.append) {
            dispatch(appendEventsSuccess({ events: mappedEvents, type: eventType }));
        } else {
            dispatch(getEventsSuccess({ events: mappedEvents, type: eventType }));
            dispatch(setLoadingComplete());
        }

        dispatch(signinHomeSuccess({ eventInfo: data }));
        return data;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load signed-in events';
        dispatch(signinHomeFailure(errorMessage));
        return { error: errorMessage };
    }
};

export const siginHomeInfoGet = (eventId: string, clubId?: string) => async (dispatch: AppDispatch) => {
    dispatch(siginHomeInfo());
    try {
        // Use the correct endpoint - /auth/Home (not /auth/Home/event-info)
        const queryParams = new URLSearchParams();
        if (eventId) queryParams.append('eventId', eventId);
        // Always include clubId if provided (even if empty string, the backend will use default)
        if (clubId !== undefined && clubId !== null) {
            queryParams.append('clubId', clubId);
        }
        const queryString = queryParams.toString();
        const endpoint = `/auth/Signin-Home${queryString ? `?${queryString}` : ''}`;
        
        const response = await clientApiCallWithoutToken(endpoint, undefined, 'GET');
        
        if (response.ok) {
            const data = response.data as any;
    
            
            // Check if the message indicates no event info available
            const responseMessage = data?.HttpResponse?.Message || '';
            const hasNoEventInfoMessage = responseMessage.toLowerCase().includes('no event info available') || 
                                         responseMessage.toLowerCase().includes('there is no event info available');
            
            // Don't store event info if it's a "no event info available" message
            if (hasNoEventInfoMessage && (!data?.Content || Object.keys(data.Content).length === 0)) {
                // Clear event info instead of storing the "no event info" response
                dispatch(clearEventInfo());
                return;
            }
            
            // Check if response has error message from backend
            // Only treat as error if StatusCode is NOT 200
            // If StatusCode is 200, even with "no event info available" message, it's a valid response (not an error)
            if (data?.HttpResponse?.StatusCode && data.HttpResponse.StatusCode !== 200) {
                // Don't treat "no event info available" as an error even if StatusCode is not 200
                // (though typically it should be 200)
                if (!hasNoEventInfoMessage) {
                    console.error('❌ [HomeActions] siginHomeInfoGet - Backend error:', responseMessage);
                    dispatch(siginHomeInfoFailure(`Backend error: ${responseMessage}`));
                    return;
                }
            }
            
            // Store the full response data (which includes Content)
            dispatch(siginHomeInfoSuccess({ eventInfo: data }));
        } else {
            // Extract error message from response
            const errorMessage = (response.data as any)?.HttpResponse?.Message || response.error || 'Failed to load event details';
            console.error('❌ [HomeActions] siginHomeInfoGet - Request failed:', errorMessage);
            dispatch(siginHomeInfoFailure(errorMessage));
        }
    } catch (error) {
        console.error('❌ [HomeActions] siginHomeInfoGet - Exception:', error);
        dispatch(siginHomeInfoFailure(error instanceof Error ? error.message : 'An unexpected error occurred'));
    }
}

// Get athlete authorization client info from Strava
export const getAthleteAuthorization = () => async (dispatch: AppDispatch) => {
    try {
        const token = getCookie('authToken');
        
        if (!token) {
            console.warn('⚠️ [HomeActions] getAthleteAuthorization - No auth token found');
            return { error: 'No authentication token found' };
        }

        const response = await clientApiCallWithToken('/auth/Starva-Authorize', token, undefined, 'GET');
        
        if (!response.ok) {
            const errorMessage = response.error || 'Failed to get athlete authorization info';
            console.error('❌ [HomeActions] getAthleteAuthorization - Request failed:', errorMessage);
            return { error: errorMessage };
        }

        console.log('✅ [HomeActions] getAthleteAuthorization - Success:', response.data);
        return response.data;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('❌ [HomeActions] getAthleteAuthorization - Exception:', error);
        return { error: errorMessage };
    }
};

export const getMyEvents = () => async (dispatch: AppDispatch) => {
        const token = getCookie('authToken');
        if (!token) {
            console.warn('⚠️ [HomeActions] getMyEvents - No auth token found');
            return { error: 'No authentication token found' };
        }
        try {
            dispatch(getMyEventsRequest());
            const requestBody = {
                PageNo: 1,
                PageSize: 10,
                Keyword: '',
                IsCompleted: true,
            };
        const response = await clientApiCallWithToken('/auth/My-Events', token, requestBody, 'POST');
        
        // Check for StatusCode 204 (No Content) - treat as success with empty content
        if (response.status === 204 || (response.data && (response.data as any)?.HttpResponse?.StatusCode === 204)) {
            console.log('✅ [getMyEvents] StatusCode 204 - No registrations found (this is a success, not an error)');
            const data = response.data as any || { HttpResponse: { StatusCode: 204, Message: 'No registrations found.' }, Content: null };
            dispatch(getMyEventsSuccess({ events: [], type: 'my-events', response: data }));
            return data;
        }
        
        if (!response.ok) {
            const errorMessage = (response.data as any)?.HttpResponse?.Message || response.error || 'Failed to load my events';
            dispatch(getMyEventsFailure(errorMessage));
            return { error: errorMessage };
        }
        const data = response.data as any;
            dispatch(getMyEventsSuccess({ events: data.Content?.MyEventListRecords || [], type: 'my-events', response: data }));
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load my events';
            dispatch(getMyEventsFailure(errorMessage));
            return { error: errorMessage };
        }
    }

export const getMyEventsDetails = (eventId: string) => async (dispatch: AppDispatch) => {
    dispatch(getMyEventsDetailsRequest());
    try {
        const token = getCookie('authToken');
        if (!token) {
            console.warn('⚠️ [HomeActions] getMyEventsDetails - No auth token found');
            return { error: 'No authentication token found' };
        }
        // For GET request, pass eventId as query parameter
        const url = `/auth/My-Events?id=${encodeURIComponent(eventId)}`;
        const response = await clientApiCallWithToken(url, token, undefined, 'GET');
        
        // Check for StatusCode 204 (No Content) - treat as success with empty content
        if (response.status === 204 || (response.data && (response.data as any)?.HttpResponse?.StatusCode === 204)) {
            console.log('✅ [getMyEventsDetails] StatusCode 204 - No registrations found (this is a success, not an error)');
            const data = response.data as any || { HttpResponse: { StatusCode: 204, Message: 'No registrations found.' }, Content: null };
            dispatch(getMyEventsDetailsSuccess({ eventInfo: data }));
            return data;
        }
        
        if (!response.ok) {
            const errorMessage = (response.data as any)?.HttpResponse?.Message || response.error || 'Failed to load my events details';
            dispatch(getMyEventsDetailsFailure(errorMessage));
            return { error: errorMessage };
        }
        const data = response.data as any;
        dispatch(getMyEventsDetailsSuccess({ eventInfo: data }));
        return data;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load my events details';
        dispatch(getMyEventsDetailsFailure(errorMessage));
        return { error: errorMessage };
    }
}