<template>
    <div class="container">
      <h2>Find Your Customer Details</h2>
      <form @submit.prevent="searchCustomer">
        <div class="form-group" style="display: none;">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="search.name"
            type="text"
            placeholder="Enter your name"
          />
        </div>
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="search.phone"
            type="tel"
            placeholder="Enter your phone number"
            required
          />
        </div>
        <button type="submit">Search</button>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="customers.length > 0" class="results">
        <h3>Search Results</h3>
        <ul>
          <li v-for="customer in customers" :key="customer.customerId">
            <router-link
              :to="`/customer/${tenantId}/${customer.customerId}`"
            >
             {{ customer.name }} ({{ customer.phone }})
            </router-link>
          </li>
        </ul>
      </div>
      <div v-else-if="searched && customers.length === 0" class="no-results">
        No customers found.
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios';
  
  interface Customer {
    customerId: string;
    tenantId: string;
    name: string;
    phone: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  }
  
  interface State {
    search: {
      name: string;
      phone: string;
    };
    customers: Customer[];
    error: string | null;
    searched: boolean;
  }
  
  export default defineComponent({
    name: 'CustomerSearch',
    data(): State {
      return {
        search: {
          name: '',
          phone: '',
        },
        customers: [],
        error: null,
        searched: false,
      };
    },
    computed: {
      tenantId(): string {
        return '6fb59d40-20f1-4545-a418-831ecd24484e';
      },
    },
    methods: {
      async searchCustomer(): Promise<void> {
        this.error = null;
        this.searched = false;
        this.customers = [];
  
        try {
          const response = await axios.get<Customer[]>(
            `${import.meta.env.VITE_API_URL}/api/tenants/${this.tenantId}/customers`,
            {
              params: {
                search: this.search.name,
                phone: this.search.phone,
              },
            }
          );
          this.customers = response.data;
          this.searched = true;
        } catch (error: unknown) {
          const err = error as Error;
          this.error = `Failed to search customers: ${err.message} (Stack: ${err.stack})`;
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
  .error {
    color: red;
    margin-top: 10px;
  }
  .results {
    margin-top: 20px;
  }
  .results ul {
    list-style: none;
    padding: 0;
  }
  .results li {
    margin-bottom: 10px;
  }
  .no-results {
    margin-top: 20px;
    color: #555;
  }
  </style>