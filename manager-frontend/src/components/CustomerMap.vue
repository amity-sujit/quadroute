<!-- src/components/CustomerMap.vue -->
<template>
  <div>
    <h2>Customer Map</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div ref="mapRef" style="height: 500px; width: 100%"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L, { Map, Marker, LatLngExpression, LatLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { Customer } from '../types/customer'
// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png'
})
export default defineComponent({
  name: 'CustomerMap',
  setup () {
    const router = useRouter()
    const map = ref<Map | null>(null)
    const mapRef = ref<HTMLElement | null>(null)
    const customers = ref<Customer[]>([])
    const error = ref<string | null>(null)

    const fetchCustomers = async () => {
      try {
        console.log('Fetching customers...')
        const response = await axios.get<Customer[]>('http://localhost:5055/api/customers')
        console.log('Customers fetched:', response.data)
        customers.value = response.data
      } catch (err) {
        console.error('Error fetching customers:', err)
        error.value = 'Failed to load customers. Please try again.'
      }
    }

    const goToCustomerProfile = (customerId: string) => {
      router.push({ name: 'CustomerProfile', params: { id: customerId } })
    }

    onMounted(async () => {
      // Ensure the DOM is fully rendered before accessing the ref
      await nextTick()
      console.log('Map ref after nextTick:', mapRef.value)

      if (!mapRef.value) {
        error.value = 'Map container not found.'
        console.error('Map container element is still null after nextTick!')
        return
      }

      try {
        // Initialize the map with a default center (will adjust later)
        map.value = L.map(mapRef.value).setView([12.9716, 77.5946] as LatLngExpression, 10)
        console.log('Map initialized:', map.value)

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map.value as Map)

        // Fetch customers and add markers
        await fetchCustomers()
        if (map.value) {
          if (customers.value.length === 0) {
            error.value = 'No customers found to display on the map.'
            return
          }

          // Create a LatLngBounds to encompass all markers
          const bounds = new L.LatLngBounds([])
          const markers: Marker[] = []

          customers.value.forEach((customer: Customer) => {
            const latLng: LatLngExpression = [customer.location.y, customer.location.x]
            const marker: Marker = L.marker(latLng)
            marker.addTo(map.value as Map)
            marker.bindPopup(customer.name)
            marker.on('click', () => {
              goToCustomerProfile(customer.customerId)
            })
            markers.push(marker)
            bounds.extend(latLng)
            console.log(`Added marker for customer: ${customer.name}`)
          })

          // Center and zoom the map to fit all markers
          if (markers.length > 0) {
            map.value.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
            console.log('Map centered to bounds:', bounds)
          } else {
            console.warn('No markers to center the map.')
          }
        }
      } catch (err) {
        console.error('Error initializing map:', err)
        error.value = 'Failed to initialize the map.'
      }
    })

    onBeforeUnmount(() => {
      if (map.value) {
        map.value.remove()
      }
    })

    return {
      mapRef,
      customers,
      error
    }
  }
})
</script>

<style scoped>
.error {
  color: red;
  margin-bottom: 10px;
}
</style>
