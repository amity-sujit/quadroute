// src/types/vehicle.ts
export interface Vehicle {
    vehicleId: string
    driverName: string
    contactNumber: string
    capacityLiters: number
    availabilityStartTime: string
    availabilityEndTime: string
    location: {
      x: number
      y: number
    }
  }
