<template>
    <div class="container">
      <h2>Confirm Your Delivery Details</h2>
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <form v-else @submit.prevent="saveDetails">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="customer.name"
            type="text"
            placeholder="Enter your name"
            required
          />
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input
            id="phone"
            v-model="customer.phone"
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
        <div class="form-group">
          <label for="autocomplete">Address or Landmark</label>
          <input
            id="autocomplete"
            type="text"
            placeholder="Enter address or landmark"
            v-model="customer.address"
          />
        </div>
        <div id="map" class="map"></div>
        <button type="submit">Save Details</button>
        <div v-if="message" class="message">{{ message }}</div>
      </form>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, nextTick } from 'vue';
  import { Loader } from '@googlemaps/js-api-loader';
  import axios from 'axios';
  
  interface Customer {
    name: string;
    phone: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  }
  
  interface State {
    customer: Customer;
    map: google.maps.Map | null;
    marker: google.maps.Marker | null;
    message: string;
    loading: boolean;
    error: string | null;
  }
  
  export default defineComponent({
    name: 'CustomerGeolocation',
    data(): State {
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
      const { tenant_id, customer_id } = this.$route.params as { tenant_id: string; customer_id: string };
      try {
        const response = await axios.get<Customer>(
          `${import.meta.env.VITE_API_URL}/api/tenants/${tenant_id}/customers/${customer_id}`
        );
        this.customer = response.data;
      } catch (error: unknown) {
        const err = error as Error;
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
        const { Map } = await loader.importLibrary('maps') as { Map: typeof google.maps.Map };
        const { Autocomplete } = await loader.importLibrary('places') as {
          Autocomplete: typeof google.maps.places.Autocomplete;
        };
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
  
        let initialPosition: google.maps.LatLngLiteral = { lat: 26.1445, lng: 91.7362 };
        if (this.customer.latitude && this.customer.longitude) {
          initialPosition = { lat: this.customer.latitude, lng: this.customer.longitude };
          this.setupMap(initialPosition, Map, Autocomplete);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
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
            },
            async () => {
              // Ensure DOM is ready for geolocation error callback
              await nextTick();
              console.log('Geolocation error callback DOM state:', {
                mapDivExists: !!document.getElementById('map'),
              });
              this.setupMap(initialPosition, Map, Autocomplete);
            }
          );
        } else {
          this.setupMap(initialPosition, Map, Autocomplete);
        }
      } catch (error: unknown) {
        const err = error as Error;
        this.error = `Failed to load map with importLibrary(): ${err.message} (Stack: ${err.stack}, API Key: ${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING'
        })`;
        console.error('importLibrary error details:', {
          message: err.message,
          stack: err.stack,
          cause: (err as any).cause,
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING',
        });
        this.loading = false;
      }
  
      // Debug await loader.load() to compare
      console.log('Debugging await loader.load() for comparison...');
      try {
        await loader.load();
        console.log('await loader.load() succeeded unexpectedly');
      } catch (error: unknown) {
        const err = error as Error;
        this.error = this.error || `Debug: await loader.load() failed: ${err.message} (Stack: ${err.stack}, API Key: ${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING'
        })`;
        console.error('await loader.load() error details:', {
          message: err.message,
          stack: err.stack,
          cause: (err as any).cause,
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'MISSING',
        });
      }
    },
    methods: {
      setupMap(
        position: google.maps.LatLngLiteral,
        Map: typeof google.maps.Map,
        Autocomplete: typeof google.maps.places.Autocomplete
      ): void {
        try {
          console.log('Setting up map with position:', position);
          const mapDiv = document.getElementById('map');
          if (!mapDiv) {
            throw new Error('Map container not found: #map element is missing in the DOM');
          }
  
          this.map = new Map(mapDiv as HTMLElement, {
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
          (autocompleteInput as HTMLInputElement).value = '';
          // Initialize with database address
          (autocompleteInput as HTMLInputElement).value = this.customer.address || '';
  
          const autocomplete = new Autocomplete(autocompleteInput as HTMLInputElement, {
            types: ['geocode'],
            componentRestrictions: { country: 'in' },
          });
  
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              console.warn('No geometry found for place:', place);
              return;
            }
  
            const newPosition: google.maps.LatLngLiteral = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
  
            console.log('Place changed, new position:', newPosition);
            this.map!.setCenter(newPosition);
            this.marker!.setPosition(newPosition);
            this.customer.address = place.formatted_address || '';
            this.customer.latitude = newPosition.lat;
            this.customer.longitude = newPosition.lng;
          });
  
          this.marker.addListener('dragend', () => {
            const position = this.marker!.getPosition()!;
            console.log('Marker dragged to:', position);
            this.customer.latitude = position.lat();
            this.customer.longitude = position.lng();
          });
        } catch (error: unknown) {
          const err = error as Error;
          this.error = `Failed to setup map: ${err.message} (Stack: ${err.stack})`;
          console.error('Map setup error:', {
            message: err.message,
            stack: err.stack,
            cause: (err as any).cause,
          });
        }
      },
      async saveDetails(): Promise<void> {
        try {
          await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/tenants/${this.$route.params.tenant_id}/customers/${this.$route.params.customer_id}`,
            {
              name: this.customer.name,
              phone: this.customer.phone,
              address: this.customer.address,
              latitude: this.customer.latitude,
              longitude: this.customer.longitude,
              is_verified: true,
            }
          );
          this.message = 'Details saved successfully!';
        } catch (error: unknown) {
          const err = error as Error;
          this.message = `Error saving details: ${err.message} (Stack: ${err.stack})`;
        }
      },
    },
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  .map {
    width: 100%;
    height: 400px;
    margin-bottom: 15px;
  }
  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  .message {
    margin-top: 10px;
    color: green;
  }
  .message.error {
    color: red;
  }
  .error {
    color: red;
    margin-bottom: 15px;
  }
  </style>