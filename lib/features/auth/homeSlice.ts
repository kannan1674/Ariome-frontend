  import { createSlice, PayloadAction } from '@reduxjs/toolkit';

  export interface Event {
    id?: number;
    Id?: string; // API uses Id (capital I)
    title?: string;
    Name?: string; // API uses Name
    dateRange?: string;
    location?: string;
    Location?: string; // API uses Location
    image?: string;
    ImagePath?: string; // API uses ImagePath
    isFree?: boolean;
    HasFreeCategory?: boolean; // API uses HasFreeCategory
    isVirtual?: boolean;
    IsVirtual?: boolean; // API uses IsVirtual
    apiId?: string;
    RegistrationOpenSoon?: boolean;
    RegistrationStartDateString?: string; // API uses RegistrationStartDateString
    RegistrationEndDateString?: string; // API uses RegistrationEndDateString
    RegistrationClosed?: boolean;
    StartDateText?: string;
    StartDateString?: string; // API uses StartDateString
    StartTimeText?: string;
    EndDateText?: string;
    EndDateString?: string; // API uses EndDateString
    IsActive?: boolean;
    Description?: string;
    EventType?: number;
    EventTypeName?: string;
    MinimumPrice?: string;
    CategoryCount?: number;
    RegistrationLimit?: number;
    HasCoupon?: boolean;
    [key: string]: any; // Allow additional properties
  }

interface EventState {
    events: Event[];
    eventsByType: {
      ongoing: Event[];
      upcoming: Event[];
      past: Event[];
    };
    loading: boolean;
    error: string | null;
  eventInfo: any;
  myEventsResponse: any; // Store full My Events API response
}

const initialState: EventState = {
    events: [],
    eventsByType: {
      ongoing: [],
      upcoming: [],
      past: [],
    },
    loading: false,
    error: null,
  eventInfo: null,
  myEventsResponse: null,
}

const resolveEventCategory = (type: string): 'ongoing' | 'upcoming' | 'past' | null => {
    switch ((type || '').toLowerCase()) {
        case 'ongoing':
        case '1':
            return 'ongoing';
        case 'upcoming':
        case '2':
            return 'upcoming';
        case 'past':
        case '3':
            return 'past';
        default:
            return null;
    }
};

const homeSlice = createSlice({
    name: 'Home',
    initialState,
    reducers: {
        getEvents: (state) => {
            state.loading = true;
        },
        getEventsSuccess: (state, action: PayloadAction<{ events: Event[]; type: string }>) => {
            const { events, type } = action.payload;
            const category = resolveEventCategory(type);
            state.events = events;
            // Clear any previous errors on success
            state.error = null;
            // Store events by type
            if (category) {
                state.eventsByType[category] = events;
            }
            // Don't set loading to false here - wait for all calls to complete
            // Loading will be set to false by setLoadingComplete action
        },
        appendEventsSuccess: (state, action: PayloadAction<{ events: Event[]; type: string }>) => {
            const { events, type } = action.payload;
            const category = resolveEventCategory(type);
            // Append new events to existing events array
            state.events = [...state.events, ...events];
            // Clear any previous errors on success
            state.error = null;
            // Store events by type
            if (category) {
                state.eventsByType[category] = events;
            }
            // Keep loading state as is - don't set to false on append calls
            // Loading will be set to false by the first call or when all calls complete
        },
        setLoadingComplete: (state) => {
            state.loading = false;
            // Clear error if we have any events at all
            if (state.events.length > 0 || 
                state.eventsByType.ongoing.length > 0 || 
                state.eventsByType.upcoming.length > 0 || 
                state.eventsByType.past.length > 0) {
                state.error = null;
            }
        },
        clearEvents: (state) => {
            state.events = [];
            state.eventsByType = {
                ongoing: [],
                upcoming: [],
                past: [],
            };
        },
        getEventsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        getEventInfo: (state) => {
            state.loading = true;
        },
        getEventInfoSuccess: (state, action: PayloadAction<{ eventInfo: Event }>) => {
            const { eventInfo } = action.payload;
            state.eventInfo = eventInfo;
            state.error = null;
            state.loading = false;
        },
        getEventInfoFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        signinHome: (state) => {
            state.loading = true;
        },
        signinHomeSuccess: (state, action: PayloadAction<{ eventInfo: any }>) => {
            const { eventInfo } = action.payload;
            state.eventInfo = eventInfo;
            state.error = null;
            state.loading = false;
        },
        signinHomeFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        siginHomeInfo: (state) => {
            state.loading = true;
        },
        siginHomeInfoSuccess: (state, action: PayloadAction<{ eventInfo: any }>) => {
            const { eventInfo } = action.payload;
            state.eventInfo = eventInfo;
            state.error = null;
            state.loading = false;
        },
        siginHomeInfoFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearEventInfo: (state) => {
            state.eventInfo = null;
            state.error = null;
        },
        getMyEventsRequest: (state) => {
            state.loading = true;
        },
        getMyEventsSuccess: (state, action: PayloadAction<{ events: Event[]; type: string; response?: any }>) => {
            const { events, type, response } = action.payload;
            state.events = events;
            state.myEventsResponse = response || null;
            state.error = null;
            state.loading = false;
        },
        getMyEventsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
            state.myEventsResponse = null;
        },
        getMyEventsDetailsRequest: (state) => {
            state.loading = true;
        },
        getMyEventsDetailsSuccess: (state, action: PayloadAction<{ eventInfo: Event }>) => {
            const { eventInfo } = action.payload;
            state.eventInfo = eventInfo;
            state.error = null;
            state.loading = false;
        },
        getMyEventsDetailsFailure: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
})

export const { getEvents, getEventsSuccess, appendEventsSuccess, clearEvents, setLoadingComplete, getEventsFailure, 
    getEventInfo, getEventInfoSuccess, getEventInfoFailure, signinHome, signinHomeSuccess, signinHomeFailure, 
    siginHomeInfo, siginHomeInfoSuccess, siginHomeInfoFailure, clearEventInfo, getMyEventsRequest, getMyEventsSuccess, getMyEventsFailure, getMyEventsDetailsRequest, getMyEventsDetailsSuccess, getMyEventsDetailsFailure } = homeSlice.actions;
export default homeSlice.reducer;