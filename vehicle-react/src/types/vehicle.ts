
export interface Manufacturer {
  id: number;
  name: string;
}

export interface CreateVehicleRequest {
  ownerName: string;
  manufacturerId: number;
  yearOfManufacture: number;
  weightKg: number;
}
