// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import CustomerMap from '../components/CustomerMap.vue'
import CustomerProfile from '../components/CustomerProfile.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/map' },
  { path: '/map', name: 'Map', component: CustomerMap },
  { path: '/customers/:id', name: 'CustomerProfile', component: CustomerProfile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
