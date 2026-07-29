'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { useAppSelector, useAppDispatch } from '@/lib/store';
import { getCities, getState, getCountry, getBloodGroup, getGender } from '@/lib/Actions/PublicActions';
import { updateProfile, getProfileInfo, getMobileCountryCode } from '@/lib/Actions/authActions';
import { PremiumMobileField } from '@/components/auth/PremiumMobileField';
import { splitPhoneNumber } from '@/lib/i18n/countryFlag';

type MobileCountryOption = {
  Id: string;
  Country?: string;
  DialDisplay?: string;
  Code?: string;
  iso2?: string;
  CountryCode?: string;
  dialCode?: string;
};

interface EditProfileFormProps {
  onClose: () => void;
  preventAutoClose: boolean;
  setPreventAutoClose: (value: boolean) => void;
  showEditProfileModal: boolean;
}

export default function EditProfileForm({
  onClose,
  preventAutoClose,
  setPreventAutoClose,
  showEditProfileModal,
}: EditProfileFormProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authState);
  const mobileDialCodes = useAppSelector((state) => state.authState.mobileDialCodes);
  const mobileCountryCodesRaw = useAppSelector((state) => state.authState.content);
  const mobileCountryCodes = useMemo(() => {
    if (Array.isArray(mobileDialCodes) && mobileDialCodes.length > 0) {
      return mobileDialCodes as MobileCountryOption[];
    }
    if (Array.isArray(mobileCountryCodesRaw)) {
      return mobileCountryCodesRaw as MobileCountryOption[];
    }
    if (Array.isArray((mobileCountryCodesRaw as { Content?: unknown[] })?.Content)) {
      return (mobileCountryCodesRaw as { Content: MobileCountryOption[] }).Content;
    }
    return [] as MobileCountryOption[];
  }, [mobileDialCodes, mobileCountryCodesRaw]);

  const { cities, state, country, bloodGroup, gender } = useAppSelector((s) => ({
    cities: s.offlineState?.citieData ?? [],
    state: s.offlineState?.stateData ?? [],
    country: s.offlineState?.countryData ?? [],
    bloodGroup: s.offlineState?.bloodGroupData ?? [],
    gender: s.offlineState?.genderData ?? [],
  }));
  const [isCountryLoading, setIsCountryLoading] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    displayName: user?.name || '',
    gender: user?.Gender || '',
    bloodGroup: user?.BloodGroupName || '',
    dob: user?.Dob || '',
    address: user?.Address || '',
    city: user?.City || '',
    state: user?.State || '',
    country: user?.Country || '',
    zipCode: user?.ZipCode || user?.Pincode || '',
    phoneNumber: '',
    mobileCountryCodeId: 'IN',
  });

  const selectedPhoneCountry = useMemo(
    () =>
      mobileCountryCodes.find((c) => c.Id === formData.mobileCountryCodeId) ||
      mobileCountryCodes.find((c) => c.CountryCode === 'IN' || c.Code === '91'),
    [mobileCountryCodes, formData.mobileCountryCodeId],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test function to manually load gender data
  const testGenderAPI = () => {
    dispatch(getGender());
  };

  // Find the state ID for the current state name
  const currentStateId = state.find((s) => String(s.id) === formData.state || s.name === formData.state)?.id;
  const currentCountryId = country.find((c) => String(c.id) === formData.country || c.name === formData.country)?.id;
  const currentCityId = cities.find((c) => String(c.id) === formData.city || c.name === formData.city)?.id;

  // Validate if all required fields are filled
  const isFormValid = () => {
    const hasFirstName = formData.firstName.trim() !== '';
    const hasLastName = formData.lastName.trim() !== '';
    const hasDisplayName = formData.displayName.trim() !== '';
    const hasDob = formData.dob.trim() !== '';
    const hasCountry = formData.country.trim() !== '';
    const hasState = formData.state.trim() !== '';
    const hasCity = formData.city.trim() !== '';
    
    return hasFirstName && hasLastName && hasDisplayName && hasDob && hasCountry && hasState && hasCity;
  };

  const isValid = isFormValid();
  


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // If state changes, fetch cities for that state
    if (field === 'state') {
      const selectedState = state.find((s) => String(s.id) === value || s.name === value);
      if (selectedState?.id != null && selectedState.id !== '') {
        setIsCityLoading(true);
        dispatch(getCities(String(selectedState.id))).finally(() => setIsCityLoading(false));
        // Clear city when state changes
        setFormData((prev) => ({
          ...prev,
          city: ''
        }));
      } else {
        return;
      }
    } else if (field === 'country') {
      const selectedCountry = country.find((c) => String(c.id) === value || c.name === value);
      if (selectedCountry?.id != null && selectedCountry.id !== '') {
        setIsStateLoading(true);
        dispatch(getState(String(selectedCountry.id))).finally(() => setIsStateLoading(false));
        setFormData((prev) => ({
          ...prev,
          state: '',
          city: ''
        }));
      }
    }
  };

  // Load lookups once when the edit modal opens (avoid remount storms / rate limits)
  useEffect(() => {
    if (!showEditProfileModal) return;

    if (country.length === 0) {
      setIsCountryLoading(true);
      dispatch(getCountry()).finally(() => setIsCountryLoading(false));
    }
    if (bloodGroup.length === 0) {
      dispatch(getBloodGroup());
    }
    if (gender.length === 0) {
      dispatch(getGender());
    }
    if (mobileCountryCodes.length === 0) {
      dispatch(getMobileCountryCode());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when modal opens
  }, [showEditProfileModal, dispatch]);

  useEffect(() => {
    if (!showEditProfileModal) return;
    if (country.length > 0 && formData.country && !country.some((c) => String(c.id) === formData.country)) {
      const match = country.find((c) => c.name === formData.country);
      if (match) {
        setFormData((prev) => ({ ...prev, country: String(match.id) }));
      }
    }
  }, [showEditProfileModal, country, formData.country]);
 
  useEffect(() => {
    if (!showEditProfileModal || currentCountryId == null || currentCountryId === '') return;
    setIsStateLoading(true);
    dispatch(getState(String(currentCountryId))).finally(() => setIsStateLoading(false));
  }, [dispatch, showEditProfileModal, currentCountryId]);
 
  useEffect(() => {
    if (!showEditProfileModal || currentStateId == null || currentStateId === '') return;
    setIsCityLoading(true);
    dispatch(getCities(String(currentStateId))).finally(() => setIsCityLoading(false));
  }, [dispatch, showEditProfileModal, currentStateId]);

  useEffect(() => {
    if (!showEditProfileModal) return;
    if (state.length > 0 && formData.state && !state.some((s) => String(s.id) === formData.state)) {
      const match = state.find((s) => s.name === formData.state);
      if (match) {
        setFormData((prev) => ({ ...prev, state: String(match.id) }));
      }
    }
  }, [showEditProfileModal, state, formData.state]);

  useEffect(() => {
    if (!showEditProfileModal) return;
    if (cities.length > 0 && formData.city && !cities.some((c) => String(c.id) === formData.city)) {
      const match = cities.find((c) => c.name === formData.city);
      if (match) {
        setFormData((prev) => ({ ...prev, city: String(match.id) }));
      }
    }
  }, [showEditProfileModal, cities, formData.city]);

  // Populate form when modal opens (or when dial list arrives for phone split)
  useEffect(() => {
    if (!showEditProfileModal || !user) return;
    const phoneRaw = user?.PhoneNumber || user?.MobileNumber || '';
    const parsed = splitPhoneNumber(phoneRaw, mobileCountryCodes);
    setFormData((prev) => ({
      ...prev,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      displayName: user?.name || '',
      gender: user?.Gender || '',
      bloodGroup: user?.BloodGroupName || '',
      dob: user?.Dob || '',
      address: user?.Address || '',
      city: user?.CityId || user?.City || prev.city || '',
      state: user?.StateId || user?.State || prev.state || '',
      country: user?.CountryId || user?.Country || prev.country || '',
      zipCode: user?.ZipCode || user?.Pincode || '',
      phoneNumber: parsed.national,
      mobileCountryCodeId: parsed.countryId,
    }));
  }, [showEditProfileModal, user, mobileCountryCodes]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
      // Prevent default form submission
      if (e) {
        e.preventDefault();
      }
  
      
      setIsSubmitting(true);
    
    try {
      // Find IDs for the selected values
      const selectedState = state.find((s) => s.id === formData.state || s.name === formData.state);
      const selectedCity = cities.find((c) => c.id === formData.city || c.name === formData.city);
      const selectedCountry = country.find((c) => c.id === formData.country || c.name === formData.country);
      const selectedGender = gender.find((g) => g.id === formData.gender || g.name === formData.gender);
      const selectedBloodGroup = bloodGroup.find((bg) => bg.id === formData.bloodGroup || bg.name === formData.bloodGroup);

      // Fallback gender data if API data is not available
      // Using the same encoded ID format as other IDs in the system
      const fallbackGenders = [
        { id: 'TTFCMVNIVlpTazlEZGpRMGJucE1hMEZDUTBSRlJrZElTVXBMVEUxT1QxQ1hQa3I0NWVUYklldmdkRGtoSHM5WVUxUWhmTC8weGVVQ2NGbmg3VVRIbXhoenM4MFg2K3hyQlNOVjh5R0xOd0E9', name: 'Male' },
        { id: 'TTFCMVNIVlpTazlEZGpRMGJucE1hMEZDUTBSRlJrZElTVXBMVEUxT1QxQ1hQa3I0NWVUYklldmdkRGtoSHM5WVUxUWhmTC8weGVVQ2NGbmg3VVRIbXhoenM4MFg2K3hyQlNOVjh5R0xOd0E9', name: 'Female' },
        { id: 'TTFCMVNIVlpTazlEZGpRMGJucE1hMEZDUTBSRlJrZElTVXBMVEUxT1QxQ1hQa3I0NWVUYklldmdkRGtoSHM5WVUxUWhmTC8weGVVQ2NGbmg3VVRIbXhoenM4MFg2K3hyQlNOVjh5R0xOd0E9', name: 'Other' }
      ];
      const fallbackGender = fallbackGenders.find((g) => g.name === formData.gender);


      // Prepare payload according to the API specification
      const payload: any = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        DisplayName: formData.displayName || `${formData.firstName} ${formData.lastName}`.trim(),
        Dob: formData.dob,
        Address: formData.address || '',
        City: selectedCity?.name || '',
        CityId: selectedCity?.id || '',
        State: selectedState?.name || '',
        StateId: selectedState?.id || '',
        Country: selectedCountry?.name || '',
        CountryId: selectedCountry?.id || '',
        Pincode: formData.zipCode || '',
        GenderId: selectedGender?.id || '',
        BloodGroupId: selectedBloodGroup?.id || '',
      };

    
      
      if (selectedGender?.id) {
        payload.GenderId = selectedGender.id;
      } else if (fallbackGender?.id) {
        payload.GenderId = fallbackGender.id;
      } else if (formData.gender) {
        const foundGender = gender.find((g) => g.name.toLowerCase() === formData.gender.toLowerCase());
        if (foundGender?.id) {
          payload.GenderId = foundGender.id;
        }
      }
      
      if (selectedBloodGroup?.id) {
        payload.BloodGroupId = selectedBloodGroup.id;
      } else if (formData.bloodGroup) {
        const foundBloodGroup = bloodGroup.find((bg) => bg.name.toLowerCase() === formData.bloodGroup.toLowerCase());
        if (foundBloodGroup?.id) {
          payload.BloodGroupId = foundBloodGroup.id;
        }
      }
      
      // Dispatch the updateProfile action
      const result = await dispatch(updateProfile(payload)) as any;
      // Check for error in result
      if (result?.error) {
        console.error('❌ [EditProfileForm] Update profile error:', result.error);
        toast.error(result.error || 'Failed to update profile.');
        return;
      }
      
      // Check for HttpResponse structure
      // Legacy APIs may return StatusCode: true instead of 200
      if (result?.HttpResponse) {
        const statusCode = result.HttpResponse.StatusCode;
        const message = result.HttpResponse.Message;
        const isOk =
          statusCode === 200 || statusCode === 201 || statusCode === true;
        
        if (isOk) {
          toast.success(
            message && message !== 'Success'
              ? message
              : 'Profile successfully updated.',
          );
          // Refresh profile info after successful update
          await dispatch(getProfileInfo());
          onClose();
        } else {
          // Show error message from HttpResponse
          toast.error(message || 'Failed to update profile.');
        }
      } else if (result && !result.error) {
        toast.success('Profile successfully updated.');
        // Refresh profile info after successful update
        await dispatch(getProfileInfo());
        onClose();
      } else {
        // Fallback error handling
        console.error('❌ [EditProfileForm] Unknown error format:', result);
        toast.error(result?.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('❌ [EditProfileForm] Exception during profile update:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
 ;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
      <div className="space-y-6 p-4 overflow-y-auto pr-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              className="h-11"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              className="h-11"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              className="h-11"
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Enter display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Gender</option>
              {gender.length > 0 ? (
                gender.map((genderItem) => (
                  <option key={genderItem.id} value={genderItem.name}>
                    {genderItem.name}
                  </option>
                ))
              ) : (
                [
                  { id: 'TTFCMVNIVlpTazlEZGpRMGJucE1hMEZDUTBSRlJrZElTVXBMVEUxT1QxQ1hQa3I0NWVUYklldmdkRGtoSHM5WVUxUWhmTC8weGVVQ2NGbmg3VVRIbXhoenM4MFg2K3hyQlNOVjh5R0xOd0E9', name: 'Male' },
                  { id: 'TTFCMVNIVlpTazlEZGpRMGJucE1hMEZDUTBSRlJrZElTVXBMVEUxT1QxQ1hQa3I0NWVUYklldmdkRGtoSHM5WVUxUWhmTC8weGVVQ2NGbmg3VVRIbXhoenM4MFg2K3hyQlNOVjh5R0xOd0E9', name: 'Female' },
                  { id: 'TTFCMVNIVlpTazlEZGpRMGJucE1hMEZDUTBSRlJrZElTVXBMVEUxT1QxQ1hQa3I0NWVUYklldmdkRGtoSHM5WVUxUWhmTC8weGVVQ2NGbmg3VVRIbXhoenM4MFg2K3hyQlNOVjh5R0xOd0E9', name: 'Other' }
                ].map((genderItem) => (
                  <option key={genderItem.id} value={genderItem.name}>
                    {genderItem.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <select
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Blood Group</option>
              {bloodGroup.length > 0 ? (
                bloodGroup.map((bloodGroupItem) => (
                  <option key={bloodGroupItem.id} value={bloodGroupItem.name}>
                    {bloodGroupItem.name}
                  </option>
                ))
              ) : (
                bloodGroup.map((bloodGroupItem) => (
                  <option key={bloodGroupItem.id} value={bloodGroupItem.name}>
                    {bloodGroupItem.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              className="h-11"
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <PremiumMobileField
              id="phoneNumber"
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(value) => handleInputChange('phoneNumber', value)}
              countries={mobileCountryCodes}
              selectedCountry={selectedPhoneCountry}
              onCountrySelect={(c) =>
                handleInputChange('mobileCountryCodeId', c.Id)
              }
              countryDisabled
              inputDisabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isCountryLoading}
            >
              <option value="">{isCountryLoading ? 'Loading countries...' : 'Select Country'}</option>
              {country.map((countryItem) => (
                <option key={countryItem.id} value={countryItem.id}>
                  {countryItem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isStateLoading || !country.length}
            >
              <option value="">{isStateLoading ? 'Loading states...' : 'Select State'}</option>
              {state.map((stateItem) => (
                <option key={stateItem.id} value={stateItem.id}>
                  {stateItem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isCityLoading}
            >
              <option value="">{isCityLoading ? 'Loading cities...' : 'Select City'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Pin Code</Label>
            <Input
              className="h-11"
              id="zipCode"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={formData.zipCode}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleInputChange('zipCode', value);
              }}
              placeholder="Enter zip code"
            />
          </div>

        
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter full address"
            className="min-h-[120px]"
          />
        </div>
      </div>
      <div className="flex flex-row justify-end gap-3 border-t border-gray-200 p-4 w-full">
              <Button
                variant="outline"
                onClick={() => onClose()}
                className="bg-white text-gray-700 font-medium h-10 rounded-xl border-gray-200 w-[92px] cursor-pointer"
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting || !isValid}
                className="bg-violet-700 hover:bg-violet-700 text-white font-medium h-10 rounded-xl w-[92px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
    </form>
  );
}
