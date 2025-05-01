<!-- src/components/ManagerDashboard.vue -->
<template>
  <div class="dashboard-container">
    <h2>Manager Dashboard</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="metrics">
      <div class="metric" @click="navigateToMap">
        <h3>Total Customers</h3>
        <p class="metric-value">{{ totalCustomers }}</p>
      </div>
      <div class="metric">
        <h3>Total Orders</h3>
        <p class="metric-value">{{ totalOrders }}</p>
      </div>
      <div class="metric">
        <h3>Pending Orders</h3>
        <p class="metric-value">{{ pendingOrders }}</p>
      </div>
      <div class="metric">
        <h3>Delivered Orders</h3>
        <p class="metric-value">{{ deliveredOrders }}</p>
      </div>
      <div class="metric">
        <h3>Total Stores</h3>
        <p class="metric-value">{{ totalStores }}</p>
      </div>
      <div class="metric">
        <h3>Total Vehicles</h3>
        <p class="metric-value">{{ totalVehicles }}</p>
      </div>
    </div>
    <button class="action-button" @click="navigateToMap">View Customer Map</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Customer } from '../types/customer'
import { Order } from '../types/order'
import { Vehicle } from '../types/vehicle'

interface Store {
  storeId: string
  name: string
  location: { x: number, y: number }
  capacityLiters: number
}

export default defineComponent({
  name: 'ManagerDashboard',
  setup () {
    const router = useRouter()
    const totalCustomers = ref(0)
    const totalOrders = ref(0)
    const pendingOrders = ref(0)
    const deliveredOrders = ref(0)
    const totalStores = ref(0)
    const totalVehicles = ref(0)
    const loading = ref(true)
    const error = ref<string | null>(null)

    const fetchMetrics = async () => {
      try {
        const customersResponse = await axios.get<Customer[]>('https://www.quadroutedeliveryapi.somee.com/api/customers')
        totalCustomers.value = customersResponse.data.length

        const ordersResponse = await axios.get<Order[]>('https://www.quadroutedeliveryapi.somee.com/api/orders')
        totalOrders.value = ordersResponse.data.length
        pendingOrders.value = ordersResponse.data.filter(order => order.status.toLowerCase() === 'pending').length
        deliveredOrders.value = ordersResponse.data.filter(order => order.status.toLowerCase() === 'delivered').length

        const storesResponse = await axios.get<Store[]>('https://www.quadroutedeliveryapi.somee.com/api/stores')
        totalStores.value = storesResponse.data.length

        const vehiclesResponse = await axios.get<Vehicle[]>('https://www.quadroutedeliveryapi.somee.com/api/vehicles')
        totalVehicles.value = vehiclesResponse.data.length
      } catch (err) {
        console.error('Error fetching metrics:', err)
        error.value = 'Failed to load dashboard metrics.'
      }
    }

    const navigateToMap = () => {
      router.push({ name: 'Map' })
    }

    onMounted(async () => {
      loading.value = true
      await fetchMetrics()
      loading.value = false
    })

    return {
      totalCustomers,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalStores,
      totalVehicles,
      loading,
      error,
      navigateToMap
    }
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  color: #333;
}

.error {
  color: red;
  text-align: center;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  font-size: 1.2em;
  color: #666;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.metric {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
  cursor: pointer;
}

.metric:hover {
  transform: translateY(-5px);
}

.metric h3 {
  margin: 0 0 10px;
  color: #555;
}

.metric-value {
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
}

.action-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.3s;
}

.action-button:hover {
  background: #2980b9;
}
</style>
