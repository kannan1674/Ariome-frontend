import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OptionItem = {
  id: string | number;
  name: string;
};

type TShirtPayload = {
  items: OptionItem[];
  label?: string;
};

interface OfflineState {
  isLoading: boolean;
  error: string | null;
  genderData: OptionItem[];
  bloodGroupData: OptionItem[];
  relationshipData: OptionItem[];
  countryData: OptionItem[];
  stateData: OptionItem[];
  citieData: OptionItem[];
  categoryData: Array<OptionItem & { price?: string; categoryAmount?: string; totalPayableAmount?: string }>;
  tShirtData: TShirtPayload;
}

const initialState: OfflineState = {
  isLoading: false,
  error: null,
  genderData: [],
  bloodGroupData: [],
  relationshipData: [],
  countryData: [],
  stateData: [],
  citieData: [],
  categoryData: [],
  tShirtData: { items: [], label: 'Select T-shirt Size' },
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    GenderRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    GenderSuccess: (state) => {
      state.isLoading = false;
    },
    GenderFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setGenderData: (state, action: PayloadAction<OptionItem[]>) => {
      state.genderData = action.payload;
    },

    BloodGroupRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    BloodGroupSuccess: (state) => {
      state.isLoading = false;
    },
    BloodGroupFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setBloodGroupData: (state, action: PayloadAction<OptionItem[]>) => {
      state.bloodGroupData = action.payload;
    },

    RelationshipRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    RelationshipSuccess: (state) => {
      state.isLoading = false;
    },
    RelationshipFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setRelationshipData: (state, action: PayloadAction<OptionItem[]>) => {
      state.relationshipData = action.payload;
    },

    CountryRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    CountrySuccess: (state) => {
      state.isLoading = false;
    },
    CountryFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCountryData: (state, action: PayloadAction<OptionItem[]>) => {
      state.countryData = action.payload;
    },

    StateRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    StateSuccess: (state) => {
      state.isLoading = false;
    },
    StateFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setStateData: (state, action: PayloadAction<OptionItem[]>) => {
      state.stateData = action.payload;
    },

    CitiesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    CitiesSuccess: (state) => {
      state.isLoading = false;
    },
    CitiesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCitieData: (state, action: PayloadAction<OptionItem[]>) => {
      state.citieData = action.payload;
    },

    CategoryRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    CategorySuccess: (state) => {
      state.isLoading = false;
    },
    CategoryFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCategoryData: (
      state,
      action: PayloadAction<Array<OptionItem & { price?: string; categoryAmount?: string; totalPayableAmount?: string }>>
    ) => {
      state.categoryData = action.payload;
    },

    TShirtRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    TShirtSuccess: (state) => {
      state.isLoading = false;
    },
    TShirtFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setTShirtData: (state, action: PayloadAction<TShirtPayload>) => {
      state.tShirtData = action.payload;
    },
  },
});

export const {
  GenderRequest,
  GenderSuccess,
  GenderFailure,
  setGenderData,
  BloodGroupRequest,
  BloodGroupSuccess,
  BloodGroupFailure,
  setBloodGroupData,
  RelationshipRequest,
  RelationshipSuccess,
  RelationshipFailure,
  setRelationshipData,
  CountryRequest,
  CountrySuccess,
  CountryFailure,
  setCountryData,
  StateRequest,
  StateSuccess,
  StateFailure,
  setStateData,
  CitiesRequest,
  CitiesSuccess,
  CitiesFailure,
  setCitieData,
  CategoryRequest,
  CategorySuccess,
  CategoryFailure,
  setCategoryData,
  TShirtRequest,
  TShirtSuccess,
  TShirtFailure,
  setTShirtData,
} = offlineSlice.actions;

export default offlineSlice.reducer;
