
import type { VehicleForm } from "./types/vehicle";


const API_URL = "/api/vehicles";

export async function saveVehicle(
    vehicle: VehicleForm
    ): Promise<string> {
    const response = await fetch(API_URL, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({
    ownerName: vehicle.ownerName.trim(),
    manufacturerId: Number(vehicle.manufacturerId),
    yearOfManufacture: Number(vehicle.yearOfManufacture),
    weightKg: Number(vehicle.weightKg),
    }),
});

const result = await response.json().catch(() => null);

if (!response.ok) {
throw new Error(
result?.message ?? "Unable to save the vehicle."
);
}

return result?.message ?? "Vehicle saved successfully.";
}


