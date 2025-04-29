// src/types/order.ts
export interface Order {
    orderId: string
    customerId: string
    vehicleId: string | null
    milkType: string
    quantityLiters: number
    deliveryDate: string
    deliveryTimeWindow: string
    status: string
  }
