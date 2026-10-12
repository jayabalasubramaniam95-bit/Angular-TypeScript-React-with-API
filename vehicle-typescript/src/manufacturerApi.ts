import type { Manufacturer } from "./types/vehicle";

const API_URL = "/api/manufacturers";

export async function getManufacturers(): Promise<Manufacturer[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to load manufacturers.");
  }

  return (await response.json()) as Manufacturer[];
}