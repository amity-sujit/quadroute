<template>
    <div class="container mx-auto p-6 max-w-3xl bg-teal-light rounded-lg shadow-lg">
      <h2 class="text-3xl font-bold mb-8 text-center text-teal-primary">Thank you for choosing Uphaar dairy!</h2>
      <h3 class="text-3xl font-bold mb-8 text-center text-teal-primary">For your high purity dairy needs</h3>
      <form v-if="!loading" @submit.prevent="submitForm" class="space-y-8 bg-white p-8 rounded-lg shadow-md">
        <!-- Customer Details -->
        <h3 class="text-xl font-semibold text-teal-primary">Personal Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="customerName" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              v-model="form.customerName"
              id="customerName"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.customerName }"
              required
            />
            <p v-if="errors.customerName" class="text-red-500 text-sm mt-1">{{ errors.customerName }}</p>
          </div>
          <div>
            <label for="billingName" class="block text-sm font-medium text-gray-700">Billing Name</label>
            <input
              v-model="form.billingName"
              id="billingName"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.billingName }"
              required
            />
            <p v-if="errors.billingName" class="text-red-500 text-sm mt-1">{{ errors.billingName }}</p>
          </div>
          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              v-model="form.phoneNumber"
              id="phoneNumber"
              type="tel"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.phoneNumber }"
              required
            />
            <p v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1">{{ errors.phoneNumber }}</p>
          </div>
        </div>
  
        <!-- Address Details -->
        <h3 class="text-xl font-semibold text-teal-primary mt-6">Delivery Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="addressFullName" class="block text-sm font-medium text-gray-700">Recipient Name</label>
            <input
              v-model="form.address.fullName"
              id="addressFullName"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.addressFullName }"
              required
            />
            <p v-if="errors.addressFullName" class="text-red-500 text-sm mt-1">{{ errors.addressFullName }}</p>
          </div>
          <div>
            <label for="mobileNumber" class="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              v-model="form.address.mobileNumber"
              id="mobileNumber"
              type="tel"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.addressMobileNumber }"
              required
            />
            <p v-if="errors.addressMobileNumber" class="text-red-500 text-sm mt-1">{{ errors.addressMobileNumber }}</p>
          </div>
          <div>
            <label for="pincode" class="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              v-model="form.address.pincode"
              id="pincode"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.pincode }"
              required
            />
            <p v-if="errors.pincode" class="text-red-500 text-sm mt-1">{{ errors.pincode }}</p>
          </div>
          <div>
            <label for="flatHouse" class="block text-sm font-medium text-gray-700">Flat/House No.</label>
            <input
              v-model="form.address.flatHouse"
              id="flatHouse"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.flatHouse }"
              required
            />
            <p v-if="errors.flatHouse" class="text-red-500 text-sm mt-1">{{ errors.flatHouse }}</p>
          </div>
          <div>
            <label for="areaStreet" class="block text-sm font-medium text-gray-700">Area/Street</label>
            <input
              v-model="form.address.areaStreet"
              id="areaStreet"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.areaStreet }"
              required
            />
            <p v-if="errors.areaStreet" class="text-red-500 text-sm mt-1">{{ errors.areaStreet }}</p>
          </div>
          <div>
            <label for="landmark" class="block text-sm font-medium text-gray-700">Landmark (Optional)</label>
            <input
              v-model="form.address.landmark"
              id="landmark"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
            />
          </div>
          <div>
            <label for="townCity" class="block text-sm font-medium text-gray-700">Town/City</label>
            <input
              v-model="form.address.townCity"
              id="townCity"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.townCity }"
              required
            />
            <p v-if="errors.townCity" class="text-red-500 text-sm mt-1">{{ errors.townCity }}</p>
          </div>
          <div>
            <label for="state" class="block text-sm font-medium text-gray-700">State</label>
            <input
              v-model="form.address.state"
              id="state"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
              :class="{ 'border-red-500': errors.state }"
              required
            />
            <p v-if="errors.state" class="text-red-500 text-sm mt-1">{{ errors.state }}</p>
          </div>
        </div>
        <div>
          <label for="timeSlot" class="block text-sm font-medium text-gray-700">Delivery Time Slot</label>
          <select
            v-model="form.address.timeSlotId"
            id="timeSlot"
            class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
            :class="{ 'border-red-500': errors.timeSlotId }"
            required
          >
            <option value="" disabled>Select a time slot</option>
            <option v-for="slot in timeSlots" :key="slot.timeSlotId" :value="slot.timeSlotId">
              {{ slot.description }} 
            </option>
          </select>
          <p v-if="errors.timeSlotId" class="text-red-500 text-sm mt-1">{{ errors.timeSlotId }}</p>
        </div>
        <div>
        <label for="milkType" class="block text-sm font-medium text-gray-700">Milk Type</label>
        <select
          v-model="form.milkType"
          id="milkType"
          class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
          required
        >
          <option value="" disabled>Select milk type</option>
          <option value="Geer">Geer</option>
          <option value="Normal">Normal</option>
        </select>
      </div>
        <div>
          <label for="deliveryInstructions" class="block text-sm font-medium text-gray-700">Delivery Instructions (Optional)</label>
          <textarea
            v-model="form.address.deliveryInstructions"
            id="deliveryInstructions"
            class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
            rows="3"
          ></textarea>
        </div>
        <div class="flex items-center">
          <input
            v-model="form.address.isDefault"
            id="isDefault"
            type="checkbox"
            class="h-4 w-4 text-teal-primary focus:ring-teal-primary border-gray-300 rounded"
          />
          <label for="isDefault" class="ml-2 text-sm font-medium text-gray-700">Set as default address</label>
        </div>
  
        <!-- Map View -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-teal-primary">Select Delivery Location</h3>
          <p class="text-sm text-gray-600 mb-2">Search for an address or drag the marker to adjust your delivery location.</p>
          <input
            id="autocomplete"
            type="text"
            placeholder="Enter address to search"
            class="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary"
          />
          <div id="map" class="h-80 w-full border border-gray-300 rounded-md mt-4"></div>
          <button
            type="button"
            @click="getGeolocation"
            class="mt-4 bg-teal-primary text-white px-4 py-2 rounded hover:bg-teal-700"
            :disabled="isGeolocationLoading"
          >
            {{ isGeolocationLoading ? 'Fetching Location...' : 'Use Current Location' }}
          </button>
          <p v-if="form.address.latitude && form.address.longitude" class="mt-2 text-gray-600">
            Selected: {{ form.address.latitude.toFixed(4) }}, {{ form.address.longitude.toFixed(4) }}
          </p>
          <p v-if="reverseGeocodedAddress" class="mt-2 text-gray-600">
            Understood Address: {{ reverseGeocodedAddress }}
          </p>
          <p v-if="errors.geolocation" class="text-red-500 text-sm mt-1">{{ errors.geolocation }}</p>
        </div>
  
        <!-- Error Message -->
        <p v-if="errorMessage" class="text-red-500 text-sm mt-4">{{ errorMessage }}</p>
  
        <!-- Submit -->
        <button    type="submit"
            class="w-full bg-cyan-600 text-white px-4 py-3 rounded hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-500"   
            :disabled="isSubmitting || !isFormValid" >
                {{ isSubmitting ? 'Submitting...' : 'Register' }}
        </button>
      </form>
      <div v-else class="text-center text-gray-600">Loading map...</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick, computed,watch } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import { Loader } from '@googlemaps/js-api-loader';
  
  const router = useRouter();
  const form = ref({
    customerName: '',
    billingName: '',
    phoneNumber: '',
    milkType: '', // New field for milk type
    address: {
      fullName: '',
      mobileNumber: '',
      pincode: '',
      flatHouse: '',
      areaStreet: '',
      landmark: '',
      townCity: '',
      state: '',
      country: 'India',
      latitude: null,
      longitude: null,
      deliveryInstructions: '',
      timeSlotId: '',
      isDefault: true
    }
  });
  const timeSlots = ref([]);
  const errors = ref({});
  const errorMessage = ref('');
  const isSubmitting = ref(false);
  const isGeolocationLoading = ref(false);
  const loading = ref(true);
  const reverseGeocodedAddress = ref('');
  const map = ref(null);
  const marker = ref(null);
  let geocoder;
  let autocomplete;
  
  // Google Maps configuration
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING_API_KEY',
    version: 'weekly'
  });
  
  // Computed property to check form validity
  const isFormValid = computed(() => {
    validateForm();
    return Object.keys(errors.value).length === 0;
  });
  
  onMounted(async () => {
    try {
      // Fetch time slots
      const response = await axios.get('https://www.quadroutedeliveryapi.somee.com/api/dairycustomers/timeslots');
      console.log('Time slots response:', response.data);
      if (response.data.$values && Array.isArray(response.data.$values)) {
        timeSlots.value = response.data.$values.map(slot => ({
          timeSlotId: slot.timeSlotId,
          description: slot.description,
          slotStart: slot.slotStart,
          slotEnd: slot.slotEnd
        }));
      } else {
        console.error('Unexpected time slots response structure:', response.data);
        errorMessage.value = 'Failed to load time slots. Please try again.';
      }
      console.log('Mapped time slots:', timeSlots.value);
  
      // Load Google Maps libraries
      console.log('Attempting to load Google Maps libraries with importLibrary()...');
      const { Map } = await loader.importLibrary('maps');
      const { Autocomplete } = await loader.importLibrary('places');
      console.log('Google Maps libraries loaded:', { Map, Autocomplete });
  
      // Set loading to false to render form
      loading.value = false;
      await nextTick();
  
      // Debug DOM state
      const mapDiv = document.getElementById('map');
      console.log('DOM state after nextTick:', {
        mapDivExists: !!mapDiv,
        mapDiv,
        documentReadyState: document.readyState
      });
  
      // Initialize geocoder
      try {
        geocoder = new google.maps.Geocoder();
        console.log('Geocoder initialized:', geocoder);
      } catch (error) {
        console.error('Error initializing Geocoder:', error);
        errorMessage.value = 'Failed to initialize geocoding service. Some features may be limited.';
      }
  
      // Setup map
      const initialPosition = { lat: 26.1445, lng: 91.7362 }; // Guwahati
      setupMap(initialPosition, Map, Autocomplete);
    } catch (error) {
      console.error('Initialization error:', error);
      errorMessage.value = `Failed to initialize map or time slots: ${error.message}`;
      loading.value = false;
    }
  });
  
  const setupMap = (position, Map, Autocomplete) => {
    try {
      const mapDiv = document.getElementById('map');
      if (!mapDiv) {
        throw new Error('Map container not found: #map element is missing');
      }
  
      map.value = new Map(mapDiv, {
        center: position,
        zoom: 12,
        mapTypeId: 'roadmap'
      });
      console.log('Map initialized:', map.value);
  
      marker.value = new google.maps.Marker({
        position,
        map: map.value,
        draggable: true,
        title: 'Delivery Location'
      });
      console.log('Marker initialized:', marker.value);
  
      // Set initial coordinates
      form.value.address.latitude = position.lat;
      form.value.address.longitude = position.lng;
  
      // Setup Places Autocomplete
      const autocompleteInput = document.getElementById('autocomplete');
      if (!autocompleteInput) {
        throw new Error('Autocomplete input not found: #autocomplete element is missing');
      }
  
      autocompleteInput.value = ''; // Clear input
      autocomplete = new Autocomplete(autocompleteInput, {
        types: ['geocode'],
        componentRestrictions: { country: 'in' }
      });
  
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          console.warn('No geometry found for place:', place);
          return;
        }
  
        const newPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        console.log('Place changed, new position:', newPosition);
  
        map.value.setCenter(newPosition);
        map.value.setZoom(18); // Street-level zoom
        marker.value.setPosition(newPosition);
        form.value.address.latitude = newPosition.lat;
        form.value.address.longitude = newPosition.lng;
        reverseGeocodedAddress.value = place.formatted_address || '';
        updateAddressFields(place);
      });
  
      // Update coordinates on marker drag
      marker.value.addListener('dragend', () => {
        const position = marker.value.getPosition();
        form.value.address.latitude = position.lat();
        form.value.address.longitude = position.lng();
        reverseGeocode({ lat: position.lat(), lng: position.lng() });
      });
  
      // Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            await nextTick();
            console.log('Geolocation callback DOM state:', {
              mapDivExists: !!document.getElementById('map')
            });
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.value.setCenter(newPosition);
            map.value.setZoom(15);
            marker.value.setPosition(newPosition);
            form.value.address.latitude = newPosition.lat;
            form.value.address.longitude = newPosition.lng;
            await reverseGeocode(newPosition);
          },
          async () => {
            await nextTick();
            console.log('Geolocation error callback DOM state:', {
              mapDivExists: !!document.getElementById('map')
            });
            // Stay at Guwahati, no error shown
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.error('Map setup error:', error);
      errorMessage.value = `Failed to setup map: ${error.message}`;
    }
  };
  
  const updateAddressFields = (place) => {
    console.log('Updating address fields with place:', place);
    const currentFlatHouse = form.value.address.flatHouse;
    const currentAreaStreet = form.value.address.areaStreet;
    form.value.address.townCity = '';
    form.value.address.state = '';
    form.value.address.pincode = '';
    form.value.address.country = 'India';
  
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('street_number') && component.long_name) {
          form.value.address.flatHouse = component.long_name;
        }
        if (types.includes('route') && component.long_name) {
          form.value.address.areaStreet = component.long_name;
        }
        if (types.includes('locality') && component.long_name) {
          form.value.address.townCity = component.long_name;
        }
        if (types.includes('administrative_area_level_1') && component.long_name) {
          form.value.address.state = component.long_name;
        }
        if (types.includes('postal_code') && component.long_name) {
          form.value.address.pincode = component.long_name;
        }
      }
    }
  
    // Preserve flatHouse and areaStreet if not updated
    if (!form.value.address.flatHouse && currentFlatHouse) {
      form.value.address.flatHouse = currentFlatHouse;
    }
    if (!form.value.address.areaStreet && currentAreaStreet) {
      form.value.address.areaStreet = currentAreaStreet;
    }
    console.log('Updated address fields:', form.value.address);
  };
  
  const validateForm = () => {
    errors.value = {};
    const customerName = (form.value.customerName || '').trim();
    const billingName = (form.value.billingName || '').trim();
    const phoneNumber = (form.value.phoneNumber || '').trim();
    const addressFullName = (form.value.address.fullName || '').trim();
    const mobileNumber = (form.value.address.mobileNumber || '').trim();
    const pincode = (form.value.address.pincode || '').trim();
    const flatHouse = (form.value.address.flatHouse || '').trim();
    const areaStreet = (form.value.address.areaStreet || '').trim();
    const townCity = (form.value.address.townCity || '').trim();
    const state = (form.value.address.state || '').trim();
    const timeSlotId = form.value.address.timeSlotId;
  
    if (!customerName) errors.value.customerName = 'Full name is required';
    if (!billingName) errors.value.billingName = 'Billing name is required';
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      errors.value.phoneNumber = 'Enter a valid 10-digit phone number';
    }
    if (!addressFullName) errors.value.addressFullName = 'Recipient name is required';
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) {
      errors.value.addressMobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!pincode || !/^\d{6}$/.test(pincode.replace(/\D/g, ''))) {
      errors.value.pincode = 'Enter a valid 6-digit pincode';
    }
    if (!flatHouse) errors.value.flatHouse = 'Flat/House No. is required';
    if (!areaStreet) errors.value.areaStreet = 'Area/Street is required';
    if (!townCity) errors.value.townCity = 'Town/City is required';
    if (!state) errors.value.state = 'State is required';
    if (!timeSlotId) errors.value.timeSlotId = 'Select a time slot';
    if (form.value.address.latitude === null || form.value.address.longitude === null) {
      errors.value.geolocation = 'Please select or adjust the delivery location';
    }
  
    console.log('Form values:', form.value);
    console.log('Validation errors:', errors.value);
  };
  
  const getGeolocation = async () => {
    isGeolocationLoading.value = true;
    errors.value.geolocation = '';
    reverseGeocodedAddress.value = '';
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser.');
      }
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      const newPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.value.setCenter(newPosition);
      map.value.setZoom(15);
      marker.value.setPosition(newPosition);
      form.value.address.latitude = newPosition.lat;
      form.value.address.longitude = newPosition.lng;
      await reverseGeocode(newPosition);
    } catch (error) {
      console.error('Error getting geolocation:', error);
      errors.value.geolocation =
        error.code === 1
          ? 'Location access denied. Please enable location services or search for an address.'
          : 'Unable to retrieve location. Please search for an address or adjust the marker.';
    } finally {
      isGeolocationLoading.value = false;
    }
  };
  
  const reverseGeocode = async (latLng) => {
    if (!geocoder) {
      console.warn('Geocoder not initialized, skipping reverse geocoding');
      reverseGeocodedAddress.value = 'Geocoding unavailable';
      return;
    }
    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK') {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });
      if (response.length > 0) {
        reverseGeocodedAddress.value = response[0].formatted_address;
        updateAddressFields(response[0]);
      } else {
        reverseGeocodedAddress.value = 'Unable to determine address from coordinates.';
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      reverseGeocodedAddress.value = 'Unable to determine address from coordinates.';
    }
  };
  watch(
  () => form.value,
  () => {
    validateForm();
  },
  { deep: true }
);
  const submitForm = async () => {
    if (!isFormValid.value) {
      errorMessage.value = 'Please fix the errors in the form.';
      return;
    }
  
    isSubmitting.value = true;
    errorMessage.value = '';
    try {
      // First API call: Create customer
      console.log('Submitting customer data:', {
        customerName: form.value.customerName,
        billingName: form.value.billingName,
        phoneNumber: form.value.phoneNumber
      });
      const customerResponse = await axios.post('https://www.quadroutedeliveryapi.somee.com/api/dairycustomers', {
        customerName: form.value.customerName,
        billingName: form.value.billingName,
        phoneNumber: form.value.phoneNumber
      });
      console.log('Customer API response:', customerResponse.data);
  
      // Flexible customerId extraction
      const customerId =
        customerResponse.data.customer_id ||
        customerResponse.data.customerId ||
        customerResponse.data.id ||
        customerResponse.data.data?.customer_id ||
        null;
      if (!customerId) {
        throw new Error('Customer ID not returned from API. Response: ' + JSON.stringify(customerResponse.data));
      }
  // Append milkType to deliveryInstructions
  const deliveryInstructionsWithMilkType = form.value.address.deliveryInstructions
      ? `${form.value.address.deliveryInstructions} | Milk Type: ${form.value.milkType}`
      : `Milk Type: ${form.value.milkType}`;
      // Second API call: Create address
      const addressPayload = {
        fullName: form.value.address.fullName,
        mobileNumber: form.value.address.mobileNumber,
        pincode: form.value.address.pincode,
        flatHouse: form.value.address.flatHouse,
        areaStreet: form.value.address.areaStreet,
        landmark: form.value.address.landmark,
        townCity: form.value.address.townCity,
        state: form.value.address.state,
        country: form.value.address.country,
        latitude: form.value.address.latitude,
        longitude: form.value.address.longitude,
        deliveryInstructions: deliveryInstructionsWithMilkType,
        timeSlotId: parseInt(form.value.address.timeSlotId),
        isDefault: form.value.address.isDefault
      };
      console.log('Submitting address data:', addressPayload);
      const addressResponse = await axios.post(
        `https://www.quadroutedeliveryapi.somee.com/api/dairycustomers/${customerId}/addresses`,
        addressPayload
      );
      console.log('Address API response:', addressResponse.data);
  
      alert('Registration successful!');
      router.push('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      const apiErrorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      errorMessage.value = `Registration failed: ${apiErrorMessage}`;
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <style scoped>
  #map {
    height: 320px;
    width: 100%;
  }
  
  </style>
