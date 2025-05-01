// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import ManagerDashboard from '../components/ManagerDashboard.vue'
import CustomerMap from '../components/CustomerMap.vue'
import CustomerProfile from '../components/CustomerProfile.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'ManagerDashboard', component: ManagerDashboard },
  { path: '/map', name: 'Map', component: CustomerMap },
  { path: '/customers/:id', name: 'CustomerProfile', component: CustomerProfile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
