
export interface VehicleListItem {
  id: number;
  ownerName: string;
  manufacturerName: string;
  yearOfManufacture: number;
  weight: number;
  categoryName: string;
  categoryIcon: string;
}

export interface VehicleListResponse {
  vehicles: VehicleListItem[];
  search: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  sortColumn: string;
  sortDirection: string;
}

interface VehicleListQuery {
  search?: string;
  page?: number;
  sortColumn?: string;
  sortDirection?: string;
}

export async function getVehicles(
  query: VehicleListQuery = {},
): Promise<VehicleListResponse> {
  const params = new URLSearchParams();

  params.set("page", String(query.page ?? 1));
  params.set("sortColumn", query.sortColumn ?? "owner");
  params.set("sortDirection", query.sortDirection ?? "asc");

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const response = await fetch(`/api/vehicles?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to load vehicles.");
  }

  return (await response.json()) as VehicleListResponse;
}
