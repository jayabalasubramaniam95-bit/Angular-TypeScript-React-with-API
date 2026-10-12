
export interface Manufacturer {
  id: number;
  name: string;
}

export interface VehicleForm {
  ownerName: string;
  manufacturerId: number | "";
  yearOfManufacture: number | "";
  weightKg: number | "";
}

export interface Vehicle {
  id: number;
  ownerName: string;
  manufacturerId: number;
  yearOfManufacture: number;
  weightKg: number;
  categoryName: string;
}
