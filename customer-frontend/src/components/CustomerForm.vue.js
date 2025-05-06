import { ref, onMounted, nextTick, computed, watch } from 'vue';
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
        }
        else {
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
        }
        catch (error) {
            console.error('Error initializing Geocoder:', error);
            errorMessage.value = 'Failed to initialize geocoding service. Some features may be limited.';
        }
        // Setup map
        const initialPosition = { lat: 26.1445, lng: 91.7362 }; // Guwahati
        setupMap(initialPosition, Map, Autocomplete);
    }
    catch (error) {
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
            navigator.geolocation.getCurrentPosition(async (position) => {
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
            }, async () => {
                await nextTick();
                console.log('Geolocation error callback DOM state:', {
                    mapDivExists: !!document.getElementById('map')
                });
                // Stay at Guwahati, no error shown
            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        }
    }
    catch (error) {
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
    if (!customerName)
        errors.value.customerName = 'Full name is required';
    if (!billingName)
        errors.value.billingName = 'Billing name is required';
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
        errors.value.phoneNumber = 'Enter a valid 10-digit phone number';
    }
    if (!addressFullName)
        errors.value.addressFullName = 'Recipient name is required';
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) {
        errors.value.addressMobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!pincode || !/^\d{6}$/.test(pincode.replace(/\D/g, ''))) {
        errors.value.pincode = 'Enter a valid 6-digit pincode';
    }
    if (!flatHouse)
        errors.value.flatHouse = 'Flat/House No. is required';
    if (!areaStreet)
        errors.value.areaStreet = 'Area/Street is required';
    if (!townCity)
        errors.value.townCity = 'Town/City is required';
    if (!state)
        errors.value.state = 'State is required';
    if (!timeSlotId)
        errors.value.timeSlotId = 'Select a time slot';
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
    }
    catch (error) {
        console.error('Error getting geolocation:', error);
        errors.value.geolocation =
            error.code === 1
                ? 'Location access denied. Please enable location services or search for an address.'
                : 'Unable to retrieve location. Please search for an address or adjust the marker.';
    }
    finally {
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
                }
                else {
                    reject(new Error(`Reverse geocoding failed: ${status}`));
                }
            });
        });
        if (response.length > 0) {
            reverseGeocodedAddress.value = response[0].formatted_address;
            updateAddressFields(response[0]);
        }
        else {
            reverseGeocodedAddress.value = 'Unable to determine address from coordinates.';
        }
    }
    catch (error) {
        console.error('Error reverse geocoding:', error);
        reverseGeocodedAddress.value = 'Unable to determine address from coordinates.';
    }
};
watch(() => form.value, () => {
    validateForm();
}, { deep: true });
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
        const customerId = customerResponse.data.customer_id ||
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
        const addressResponse = await axios.post(`https://www.quadroutedeliveryapi.somee.com/api/dairycustomers/${customerId}/addresses`, addressPayload);
        console.log('Address API response:', addressResponse.data);
        alert('Registration successful!');
        router.push('/');
    }
    catch (error) {
        console.error('Error submitting form:', error);
        const apiErrorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
        errorMessage.value = `Registration failed: ${apiErrorMessage}`;
    }
    finally {
        isSubmitting.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container mx-auto p-6 max-w-3xl bg-teal-light rounded-lg shadow-lg" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "text-3xl font-bold mb-8 text-center text-teal-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-3xl font-bold mb-8 text-center text-teal-primary" },
});
if (!__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.submitForm) },
        ...{ class: "space-y-8 bg-white p-8 rounded-lg shadow-md" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "text-xl font-semibold text-teal-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "customerName",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.customerName),
        id: "customerName",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.customerName }) },
        required: true,
    });
    if (__VLS_ctx.errors.customerName) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.customerName);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "billingName",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.billingName),
        id: "billingName",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.billingName }) },
        required: true,
    });
    if (__VLS_ctx.errors.billingName) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.billingName);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "phoneNumber",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "phoneNumber",
        type: "tel",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.phoneNumber }) },
        required: true,
    });
    (__VLS_ctx.form.phoneNumber);
    if (__VLS_ctx.errors.phoneNumber) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.phoneNumber);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "text-xl font-semibold text-teal-primary mt-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "addressFullName",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.fullName),
        id: "addressFullName",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.addressFullName }) },
        required: true,
    });
    if (__VLS_ctx.errors.addressFullName) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.addressFullName);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "mobileNumber",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "mobileNumber",
        type: "tel",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.addressMobileNumber }) },
        required: true,
    });
    (__VLS_ctx.form.address.mobileNumber);
    if (__VLS_ctx.errors.addressMobileNumber) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.addressMobileNumber);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "pincode",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.pincode),
        id: "pincode",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.pincode }) },
        required: true,
    });
    if (__VLS_ctx.errors.pincode) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.pincode);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "flatHouse",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.flatHouse),
        id: "flatHouse",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.flatHouse }) },
        required: true,
    });
    if (__VLS_ctx.errors.flatHouse) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.flatHouse);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "areaStreet",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.areaStreet),
        id: "areaStreet",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.areaStreet }) },
        required: true,
    });
    if (__VLS_ctx.errors.areaStreet) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.areaStreet);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "landmark",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.landmark),
        id: "landmark",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "townCity",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.townCity),
        id: "townCity",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.townCity }) },
        required: true,
    });
    if (__VLS_ctx.errors.townCity) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.townCity);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "state",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.form.address.state),
        id: "state",
        type: "text",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.state }) },
        required: true,
    });
    if (__VLS_ctx.errors.state) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.state);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "timeSlot",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.form.address.timeSlotId),
        id: "timeSlot",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        ...{ class: ({ 'border-red-500': __VLS_ctx.errors.timeSlotId }) },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    for (const [slot] of __VLS_getVForSourceType((__VLS_ctx.timeSlots))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (slot.timeSlotId),
            value: (slot.timeSlotId),
        });
        (slot.description);
        (slot.slotStart);
        (slot.slotEnd);
    }
    if (__VLS_ctx.errors.timeSlotId) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.timeSlotId);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "milkType",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.form.milkType),
        id: "milkType",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Geer",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Normal",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "deliveryInstructions",
        ...{ class: "block text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: (__VLS_ctx.form.address.deliveryInstructions),
        id: "deliveryInstructions",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
        rows: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex items-center" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "isDefault",
        type: "checkbox",
        ...{ class: "h-4 w-4 text-teal-primary focus:ring-teal-primary border-gray-300 rounded" },
    });
    (__VLS_ctx.form.address.isDefault);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "isDefault",
        ...{ class: "ml-2 text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-6" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "text-lg font-semibold text-teal-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-sm text-gray-600 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "autocomplete",
        type: "text",
        placeholder: "Enter address to search",
        ...{ class: "mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-teal-primary focus:border-teal-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: "map",
        ...{ class: "h-80 w-full border border-gray-300 rounded-md mt-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.getGeolocation) },
        type: "button",
        ...{ class: "mt-4 bg-teal-primary text-white px-4 py-2 rounded hover:bg-teal-700" },
        disabled: (__VLS_ctx.isGeolocationLoading),
    });
    (__VLS_ctx.isGeolocationLoading ? 'Fetching Location...' : 'Use Current Location');
    if (__VLS_ctx.form.address.latitude && __VLS_ctx.form.address.longitude) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "mt-2 text-gray-600" },
        });
        (__VLS_ctx.form.address.latitude.toFixed(4));
        (__VLS_ctx.form.address.longitude.toFixed(4));
    }
    if (__VLS_ctx.reverseGeocodedAddress) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "mt-2 text-gray-600" },
        });
        (__VLS_ctx.reverseGeocodedAddress);
    }
    if (__VLS_ctx.errors.geolocation) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-1" },
        });
        (__VLS_ctx.errors.geolocation);
    }
    if (__VLS_ctx.errorMessage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "text-red-500 text-sm mt-4" },
        });
        (__VLS_ctx.errorMessage);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: "submit",
        ...{ class: "w-full bg-cyan-600 text-white px-4 py-3 rounded hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-500" },
        disabled: (__VLS_ctx.isSubmitting || !__VLS_ctx.isFormValid),
    });
    (__VLS_ctx.isSubmitting ? 'Submitting...' : 'Register');
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "text-center text-gray-600" },
    });
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-teal-light']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['h-80']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-teal-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-teal-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-cyan-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-cyan-700']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:bg-cyan-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            form: form,
            timeSlots: timeSlots,
            errors: errors,
            errorMessage: errorMessage,
            isSubmitting: isSubmitting,
            isGeolocationLoading: isGeolocationLoading,
            loading: loading,
            reverseGeocodedAddress: reverseGeocodedAddress,
            isFormValid: isFormValid,
            getGeolocation: getGeolocation,
            submitForm: submitForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
