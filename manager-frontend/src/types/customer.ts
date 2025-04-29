// src/types/customer.ts
export interface Customer {
    customerId: string;
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    postalCode: string;
    phoneNumber: string;
    email: string | null;
    location: {
      x: number;
      y: number;
    };
  }
