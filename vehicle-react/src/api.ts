
import type {
  Manufacturer,
  CreateVehicleRequest,
} from "./types/vehicle";

export async function getManufacturers(): Promise<Manufacturer[]> {
  const response = await fetch("/api/manufacturers");

  if (!response.ok) {
    throw new Error("Unable to load manufacturers.");
  }

  return response.json();
}

export async function createVehicle(
  vehicle: CreateVehicleRequest,
): Promise<void> {
  const response = await fetch("/api/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to save vehicle.");
  }
}
