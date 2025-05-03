import { defineComponent, nextTick } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
export default defineComponent({
    name: 'CustomerGeolocation',
    data() {
        return {
            customer: {
                name: '',
                phone: '',
                address: '',
                latitude: null,
                longitude: null,
            },
            map: null,
            marker: null,
            message: '',
            loading: true,
            error: null,
        };
    },
    async mounted() {
        const { tenant_id, customer_id } = this.$route.params;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tenants/${tenant_id}/customers/${customer_id}`);
            this.customer = response.data;
        }
        catch (error) {
            const err = error;
            this.error = `Failed to load customer data: ${err.message} (Stack: ${err.stack})`;
            this.loading = false;
            return;
        }
        const loader = new Loader({
            apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING_API_KEY',
            version: 'weekly',
        });
        try {
            // Log attempt to load libraries
            console.log('Attempting to load Google Maps libraries with importLibrary()...');
            const { Map } = await loader.importLibrary('maps');
            const { Autocomplete } = await loader.importLibrary('places');
            console.log('Google Maps libraries loaded successfully:', { Map, Autocomplete });
            // Set loading to false to render the form containing #map
            this.loading = false;
            // Wait for DOM to update
            await nextTick();
            // Debug DOM state
            const mapDivCheck = document.getElementById('map');
            console.log('DOM state after nextTick:', {
                mapDivExists: !!mapDivCheck,
                mapDiv: mapDivCheck,
                documentReadyState: document.readyState,
            });
            let initialPosition = { lat: 26.1445, lng: 91.7362 };
            if (this.customer.latitude && this.customer.longitude) {
                initialPosition = { lat: this.customer.latitude, lng: this.customer.longitude };
                this.setupMap(initialPosition, Map, Autocomplete);
            }
            else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    // Ensure DOM is ready for geolocation callback
                    await nextTick();
                    console.log('Geolocation callback DOM state:', {
                        mapDivExists: !!document.getElementById('map'),
                    });
                    initialPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    this.setupMap(initialPosition, Map, Autocomplete);
                }, async () => {
                    // Ensure DOM is ready for geolocation error callback
                    await nextTick();
                    console.log('Geolocation error callback DOM state:', {
                        mapDivExists: !!document.getElementById('map'),
                    });
                    this.setupMap(initialPosition, Map, Autocomplete);
                });
            }
            else {
                this.setupMap(initialPosition, Map, Autocomplete);
            }
        }
        catch (error) {
            const err = error;
            this.error = `Failed to load map with importLibrary(): ${err.message} (Stack: ${err.stack}, API Key: ${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING'})`;
            console.error('importLibrary error details:', {
                message: err.message,
                stack: err.stack,
                cause: err.cause,
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING',
            });
            this.loading = false;
        }
        // Debug await loader.load() to compare
        console.log('Debugging await loader.load() for comparison...');
        try {
            await loader.load();
            console.log('await loader.load() succeeded unexpectedly');
        }
        catch (error) {
            const err = error;
            this.error = this.error || `Debug: await loader.load() failed: ${err.message} (Stack: ${err.stack}, API Key: ${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING'})`;
            console.error('await loader.load() error details:', {
                message: err.message,
                stack: err.stack,
                cause: err.cause,
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING',
            });
        }
    },
    methods: {
        setupMap(position, Map, Autocomplete) {
            try {
                console.log('Setting up map with position:', position);
                const mapDiv = document.getElementById('map');
                if (!mapDiv) {
                    throw new Error('Map container not found: #map element is missing in the DOM');
                }
                this.map = new Map(mapDiv, {
                    center: position,
                    zoom: 12,
                });
                this.marker = new google.maps.Marker({
                    position: position,
                    map: this.map,
                    draggable: true,
                });
                const autocompleteInput = document.getElementById('autocomplete');
                if (!autocompleteInput) {
                    throw new Error('Autocomplete input not found: #autocomplete element is missing in the DOM');
                }
                // Clear input to prevent stale Google Places data
                autocompleteInput.value = '';
                // Initialize with database address
                autocompleteInput.value = this.customer.address || '';
                const autocomplete = new Autocomplete(autocompleteInput, {
                    types: ['geocode'],
                    componentRestrictions: { country: 'in' },
                });
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry || !place.geometry.location) {
                        console.warn('No geometry found for place:', place);
                        return;
                    }
                    const newPosition = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    console.log('Place changed, new position:', newPosition);
                    this.map.setCenter(newPosition);
                    this.marker.setPosition(newPosition);
                    this.customer.address = place.formatted_address || '';
                    this.customer.latitude = newPosition.lat;
                    this.customer.longitude = newPosition.lng;
                });
                this.marker.addListener('dragend', () => {
                    const position = this.marker.getPosition();
                    console.log('Marker dragged to:', position);
                    this.customer.latitude = position.lat();
                    this.customer.longitude = position.lng();
                });
            }
            catch (error) {
                const err = error;
                this.error = `Failed to setup map: ${err.message} (Stack: ${err.stack})`;
                console.error('Map setup error:', {
                    message: err.message,
                    stack: err.stack,
                    cause: err.cause,
                });
            }
        },
        async saveDetails() {
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/tenants/${this.$route.params.tenant_id}/customers/${this.$route.params.customer_id}`, {
                    name: this.customer.name,
                    phone: this.customer.phone,
                    address: this.customer.address,
                    latitude: this.customer.latitude,
                    longitude: this.customer.longitude,
                    is_verified: true,
                });
                this.message = 'Details saved successfully!';
            }
            catch (error) {
                const err = error;
                this.message = `Error saving details: ${err.message} (Stack: ${err.stack})`;
            }
        },
    },
});
debugger; /* PartiallyEnd: #3632/script.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error" },
    });
    (__VLS_ctx.error);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.saveDetails) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "name",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "name",
        value: (__VLS_ctx.customer.name),
        type: "text",
        placeholder: "Enter your name",
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "phone",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "phone",
        type: "tel",
        placeholder: "Enter your phone number",
    });
    (__VLS_ctx.customer.phone);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "autocomplete",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        id: "autocomplete",
        type: "text",
        placeholder: "Enter address or landmark",
        value: (__VLS_ctx.customer.address),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: "map",
        ...{ class: "map" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: "submit",
    });
    if (__VLS_ctx.message) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "message" },
        });
        (__VLS_ctx.message);
    }
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['map']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
var __VLS_dollars;
let __VLS_self;
