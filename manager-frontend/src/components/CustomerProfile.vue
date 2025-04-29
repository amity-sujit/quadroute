<!-- src/components/CustomerProfile.vue -->
<template>
  <div>
    <h2>Customer Profile</h2>
    <button @click="goToMap">Back to Map</button>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="customer">
      <h3>{{ customer.name }}</h3>
      <p><strong>Address:</strong> {{ customer.addressLine1 }} {{ customer.addressLine2 ? `, ${customer.addressLine2}` : '' }}, {{ customer.city }}, {{ customer.postalCode }}</p>
      <p><strong>Phone:</strong> {{ customer.phoneNumber }}</p>
      <p><strong>Email:</strong> {{ customer.email || 'N/A' }}</p>
      <p><strong>Location:</strong> Lat: {{ customer.location.y }}, Lng: {{ customer.location.x }}</p>

      <h4>Last Order</h4>
      <div v-if="!lastOrder">No orders found for this customer.</div>
      <div v-else class="last-order">
        <p><strong>Order ID:</strong> {{ lastOrder.orderId }}</p>
        <p><strong>Milk Type:</strong> {{ lastOrder.milkType }}</p>
        <p><strong>Quantity:</strong> {{ lastOrder.quantityLiters }} Liters</p>
        <p><strong>Delivery Date:</strong> {{ new Date(lastOrder.deliveryDate).toLocaleDateString() }}</p>
        <p><strong>Time Window:</strong> {{ lastOrder.deliveryTimeWindow }}</p>
        <p><strong>Status:</strong> {{ lastOrder.status }}</p>
        <p><strong>Assigned Vehicle:</strong> {{ lastOrder.vehicleId || 'Not Assigned' }}</p>
        <button v-if="!lastOrder.vehicleId" @click="showVehicleAssignment(lastOrder)">Assign Vehicle</button>
        <span v-else>Assigned</span>
      </div>

      <h4>All Orders</h4>
      <div v-if="orders.length === 0">No orders found for this customer.</div>
      <table v-else class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Milk Type</th>
            <th>Quantity (Liters)</th>
            <th>Delivery Date</th>
            <th>Time Window</th>
            <th>Status</th>
            <th>Assigned Vehicle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.orderId">
            <td>{{ order.orderId }}</td>
            <td>{{ order.milkType }}</td>
            <td>{{ order.quantityLiters }}</td>
            <td>{{ new Date(order.deliveryDate).toLocaleDateString() }}</td>
            <td>{{ order.deliveryTimeWindow }}</td>
            <td>{{ order.status }}</td>
            <td>{{ order.vehicleId || 'Not Assigned' }}</td>
            <td>
              <button v-if="!order.vehicleId" @click="showVehicleAssignment(order)">Assign Vehicle</button>
              <span v-else>Assigned</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Vehicle Assignment Modal -->
      <div v-if="selectedOrder" class="modal">
        <div class="modal-content">
          <h3>Assign Vehicle to Order {{ selectedOrder.orderId }}</h3>
          <div v-if="availableVehicles.length === 0">No vehicles available.</div>
          <div v-else>
            <label for="vehicleSelect">Select Vehicle:</label>
            <select id="vehicleSelect" v-model="selectedVehicleId">
              <option v-for="vehicle in availableVehicles" :key="vehicle.vehicleId" :value="vehicle.vehicleId">
                {{ vehicle.driverName }} (Capacity: {{ vehicle.capacityLiters }}L)
              </option>
            </select>
            <button @click="assignVehicle">Assign</button>
            <button @click="selectedOrder = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>Customer not found.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { Customer } from '../types/customer'
import { Order } from '../types/order'
import { Vehicle } from '../types/vehicle'

export default defineComponent({
  name: 'CustomerProfile',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const customerId = route.params.id as string
    const customer = ref<Customer | null>(null)
    const orders = ref<Order[]>([])
    const lastOrder = ref<Order | null>(null)
    const availableVehicles = ref<Vehicle[]>([])
    const selectedOrder = ref<Order | null>(null)
    const selectedVehicleId = ref<string | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)

    const fetchCustomer = async () => {
      try {
        console.log('Fetching customer with ID:', customerId)
        const response = await axios.get<Customer>(`http://localhost:5055/api/customers/${customerId}`)
        console.log('Customer fetched:', response.data)
        customer.value = response.data
      } catch (err) {
        console.error('Error fetching customer:', err)
        error.value = 'Failed to load customer details.'
      }
    }

    const fetchOrders = async () => {
      try {
        console.log('Fetching orders for customer ID:', customerId)
        const response = await axios.get<Order[]>(`http://localhost:5055/api/orders/customer/${customerId}`)
        console.log('Orders fetched:', response.data)
        orders.value = response.data
        // Sort orders by delivery date (most recent first) and get the last order
        if (orders.value.length > 0) {
          orders.value.sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime())
          lastOrder.value = orders.value[0]
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        error.value = 'Failed to load orders.'
      }
    }

    const fetchAvailableVehicles = async (timeWindow: string) => {
      try {
        const [startTime, endTime] = timeWindow.split('-')
        console.log('Fetching available vehicles for time window:', timeWindow)
        const response = await axios.get<Vehicle[]>(`http://localhost:5055/api/vehicles/available?startTime=${startTime}:00&endTime=${endTime}:00`)
        console.log('Available vehicles:', response.data)
        availableVehicles.value = response.data
      } catch (err) {
        console.error('Error fetching available vehicles:', err)
        error.value = 'Failed to load available vehicles.'
      }
    }

    const showVehicleAssignment = async (order: Order) => {
      selectedOrder.value = order
      await fetchAvailableVehicles(order.deliveryTimeWindow)
    }

    const assignVehicle = async () => {
      if (!selectedOrder.value || !selectedVehicleId.value) return

      try {
        console.log('Assigning vehicle to order:', selectedOrder.value.orderId, selectedVehicleId.value)
        await axios.post(`http://localhost:5055/api/orders/${selectedOrder.value.orderId}/assign-vehicle`, {
          vehicleId: selectedVehicleId.value
        })
        await fetchOrders() // Refresh orders to reflect the assignment
        selectedOrder.value = null
        selectedVehicleId.value = null
      } catch (err) {
        console.error('Error assigning vehicle:', err)
        error.value = 'Failed to assign vehicle.'
      }
    }

    const goToMap = () => {
      router.push({ name: 'Map' })
    }

    onMounted(async () => {
      loading.value = true
      await Promise.all([fetchCustomer(), fetchOrders()])
      loading.value = false
    })

    return {
      customer,
      orders,
      lastOrder,
      availableVehicles,
      selectedOrder,
      selectedVehicleId,
      loading,
      error,
      showVehicleAssignment,
      assignVehicle,
      goToMap
    }
  }
})
</script>

<style scoped>
.error {
  color: red;
  margin-bottom: 10px;
}

.last-order {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.orders-table th,
.orders-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.orders-table th {
  background-color: #f2f2f2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content select {
  margin: 10px 0;
  padding: 5px;
}

.modal-content button {
  margin: 5px;
  padding: 5px 10px;
}
</style>
