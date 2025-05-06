import { createRouter, createWebHistory } from 'vue-router';
import CustomerSearch from '../components/CustomerSearch.vue';
import CustomerGeolocation from '../components/CustomerGeolocation.vue';
import CustomerForm from '@/components/CustomerForm.vue';
const routes = [
    {
        path: '/',
        redirect: '/register'
    },
    { path: '/register', component: CustomerForm },
    {
        path: '/customer',
        name: 'CustomerSearch',
        component: CustomerSearch,
    },
    {
        path: '/customer/:tenant_id/:customer_id',
        name: 'CustomerGeolocation',
        component: CustomerGeolocation,
    },
    {
        path: '/customer',
        name: 'CustomerSearch',
        component: CustomerSearch,
    },
    {
        path: '/customer/:tenant_id/:customer_id',
        name: 'CustomerGeolocation',
        component: CustomerGeolocation,
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;
