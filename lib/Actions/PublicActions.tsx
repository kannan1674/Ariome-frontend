import { clientApiCallWithoutToken } from '@/lib/clientApi';
import type { AppDispatch } from '@/lib/store';
import {
  GenderRequest,
  GenderSuccess,
  GenderFailure,
  setGenderData,
  BloodGroupRequest,
  BloodGroupSuccess,
  BloodGroupFailure,
  setBloodGroupData,
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
} from '@/lib/features/auth/offlineSlice';

type OptionItem = { id: string | number; name: string };

export const getGender =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(GenderRequest());
    try {
      const response = await Promise.race([
        clientApiCallWithoutToken('/auth/gender', undefined, 'GET'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gender request timeout')), 15000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as { Content?: Array<{ Id: unknown; Name: string }> };
      const genderData: OptionItem[] =
        data.Content?.map((item) => ({
          id: item.Id as string | number,
          name: item.Name,
        })) || [];

      dispatch(setGenderData(genderData));
      dispatch(GenderSuccess({} as never));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(GenderFailure(errorMessage));
    }
  };

export const getBloodGroup =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(BloodGroupRequest());
    try {
      const response = await Promise.race([
        clientApiCallWithoutToken('/auth/BloodGroup', undefined, 'GET'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Blood group request timeout')), 15000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as { Content?: Array<{ Id: unknown; Name: string }> };
      const bloodGroupData: OptionItem[] =
        data.Content?.map((item) => ({
          id: item.Id as string | number,
          name: item.Name,
        })) || [];

      dispatch(setBloodGroupData(bloodGroupData));
      dispatch(BloodGroupSuccess({} as never));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(BloodGroupFailure(errorMessage));
    }
  };

export const getCountry =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(CountryRequest());
    try {
      const response = await Promise.race([
        clientApiCallWithoutToken('/auth/Country', undefined, 'GET'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Country request timeout')), 15000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as any;
      const content = data?.Content ?? data?.content ?? [];
      const countrySource = Array.isArray(content?.Countries)
        ? content.Countries
        : Array.isArray(content?.Country)
          ? content.Country
          : Array.isArray(content)
            ? content
            : [];

      const countryData: OptionItem[] = countrySource
        .map((item: any) => ({
          id: item.Id ?? item.id ?? item.CountryId ?? item.countryId ?? '',
          name: item.Name ?? item.name ?? item.CountryName ?? item.countryName ?? 'Unknown',
        }))
        .filter((item: OptionItem) => item.id !== '');

      dispatch(setCountryData(countryData));
      dispatch(CountrySuccess({} as never));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(CountryFailure(errorMessage));
    }
  };

export const getState =
  (countryId: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(StateRequest());
    try {
      const response = await Promise.race([
        clientApiCallWithoutToken(
          `/auth/state?countryId=${encodeURIComponent(countryId)}`,
          undefined,
          'GET'
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('State request timeout')), 15000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as any;
      const content = data?.Content ?? data?.content ?? [];
      const stateSource = Array.isArray(content?.States)
        ? content.States
        : Array.isArray(content?.State)
          ? content.State
          : Array.isArray(content)
            ? content
            : [];

      const stateData: OptionItem[] = stateSource
        .map((item: any) => ({
          id: item.Id ?? item.id ?? item.StateId ?? item.stateId ?? '',
          name: item.Name ?? item.name ?? item.StateName ?? item.stateName ?? 'Unknown',
        }))
        .filter((item: OptionItem) => item.id !== '');

      dispatch(setStateData(stateData));
      dispatch(StateSuccess({} as never));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(StateFailure(errorMessage));
    }
  };

export const getCities =
  (stateId: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(CitiesRequest());
    try {
      const response = await Promise.race([
        clientApiCallWithoutToken(
          `/auth/Cities?stateId=${encodeURIComponent(stateId)}`,
          undefined,
          'GET'
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Cities request timeout')), 15000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as any;
      const content = data?.Content ?? data?.content ?? [];
      const citySource = Array.isArray(content?.Cities)
        ? content.Cities
        : Array.isArray(content?.City)
          ? content.City
          : Array.isArray(content)
            ? content
            : [];

      const citiesData: OptionItem[] = citySource
        .map((item: any) => ({
          id: item.Id ?? item.id ?? item.CityId ?? item.cityId ?? '',
          name: item.Name ?? item.name ?? item.CityName ?? item.cityName ?? 'Unknown',
        }))
        .filter((item: OptionItem) => item.id !== '');

      dispatch(setCitieData(citiesData));
      dispatch(CitiesSuccess({} as never));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(CitiesFailure(errorMessage));
    }
  };
