<!-- src/components/CustomerProfile.vue -->
<template>
  <div class="profile-container">
    <h2>Customer Profile</h2>
    <button class="back-button" @click="goToMap">Back to Map</button>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="customer" class="customer-details">
      <h3>{{ customer.name }}</h3>
      <div class="info-grid">
        <p><strong>Address:</strong> {{ customer.addressLine1 }} {{ customer.addressLine2 ? `, ${customer.addressLine2}` : '' }}, {{ customer.city }}, {{ customer.postalCode }}</p>
        <p><strong>Phone:</strong> {{ customer.phoneNumber }}</p>
        <p><strong>Email:</strong> {{ customer.email || 'N/A' }}</p>
        <p><strong>Location:</strong> Lat: {{ customer.location.y }}, Lng: {{ customer.location.x }}</p>
      </div>

      <h4>Last Order</h4>
      <div v-if="!lastOrder" class="no-data">No orders found for this customer.</div>
      <div v-else class="last-order">
        <p><strong>Order ID:</strong> {{ lastOrder.orderId }}</p>
        <p><strong>Milk Type:</strong> {{ lastOrder.milkType }}</p>
        <p><strong>Quantity:</strong> {{ lastOrder.quantityLiters }} Liters</p>
        <p><strong>Delivery Date:</strong> {{ new Date(lastOrder.deliveryDate).toLocaleDateString() }}</p>
        <p><strong>Time Window:</strong> {{ lastOrder.deliveryTimeWindow }}</p>
        <p><strong>Status:</strong> {{ lastOrder.status }}</p>
        <p><strong>Assigned Vehicle:</strong> {{ lastOrder.vehicleId || 'Not Assigned' }}</p>
        <button v-if="!lastOrder.vehicleId" class="action-button" @click="showVehicleAssignment(lastOrder)">Assign Vehicle</button>
        <span v-else class="assigned-label">Assigned</span>
      </div>

      <h4>All Orders</h4>
      <div v-if="orders.length === 0" class="no-data">No orders found for this customer.</div>
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
              <button v-if="!order.vehicleId" class="action-button small" @click="showVehicleAssignment(order)">Assign Vehicle</button>
              <span v-else class="assigned-label">Assigned</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Vehicle Assignment Modal -->
      <div v-if="selectedOrder" class="modal">
        <div class="modal-content">
          <h3>Assign Vehicle to Order {{ selectedOrder.orderId }}</h3>
          <div v-if="availableVehicles.length === 0" class="no-data">No vehicles available.</div>
          <div v-else>
            <label for="vehicleSelect">Select Vehicle:</label>
            <select id="vehicleSelect" v-model="selectedVehicleId" class="select-input">
              <option v-for="vehicle in availableVehicles" :key="vehicle.vehicleId" :value="vehicle.vehicleId">
                {{ vehicle.driverName }} (Capacity: {{ vehicle.capacityLiters }}L)
              </option>
            </select>
            <div class="modal-buttons">
              <button class="action-button" @click="assignVehicle">Assign</button>
              <button class="cancel-button" @click="selectedOrder = null">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-data">Customer not found.</div>
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
        const response = await axios.get<Customer>(`https://www.quadroutedeliveryapi.somee.com/api/customers/${customerId}`)
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
        const response = await axios.get<Order[]>(`https://www.quadroutedeliveryapi.somee.com/api/orders/customer/${customerId}`)
        console.log('Orders fetched:', response.data)
        orders.value = response.data
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
        const response = await axios.get<Vehicle[]>(`https://www.quadroutedeliveryapi.somee.com/api/vehicles/available?startTime=${startTime}:00&endTime=${endTime}:00`)
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
        await axios.post(`https://www.quadroutedeliveryapi.somee.com/api/orders/${selectedOrder.value.orderId}/assign-vehicle`, {
          vehicleId: selectedVehicleId.value
        })
        await fetchOrders()
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
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2, h3, h4 {
  color: #333;
}

h2 {
  text-align: center;
}

.error {
  color: red;
  text-align: center;
  margin-bottom: 20px;
}

.loading, .no-data {
  text-align: center;
  font-size: 1.2em;
  color: #666;
  margin-bottom: 20px;
}

.customer-details {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.info-grid p {
  margin: 5px 0;
}

.last-order {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.orders-table th,
.orders-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.orders-table th {
  background-color: #f2f2f2;
  color: #333;
}

.orders-table tr:nth-child(even) {
  background-color: #f9f9f9;
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
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.select-input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.back-button, .action-button, .cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button {
  display: block;
  margin: 20px auto;
  background: #3498db;
  color: white;
}

.back-button:hover {
  background: #2980b9;
}

.action-button {
  background: #2ecc71;
  color: white;
}

.action-button:hover {
  background: #27ae60;
}

.action-button.small {
  padding: 5px 10px;
  font-size: 0.9em;
}

.cancel-button {
  background: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background: #c0392b;
}

.assigned-label {
  color: #27ae60;
  font-weight: bold;
}
</style>
