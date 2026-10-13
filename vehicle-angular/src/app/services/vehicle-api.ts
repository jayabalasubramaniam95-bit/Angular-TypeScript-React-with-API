
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Manufacturer {
  id: number;
  name: string;
}

export interface VehicleRequest {
  ownerName: string;
  manufacturerId: number;
  yearOfManufacture: number;
  weightKg: number;
}

export interface Vehicle {
  id: number;
  ownerName: string;
  manufacturerName: string;
  yearOfManufacture: number;
  weight: number;
  categoryName: string;
  categoryIcon?: string;
  weightSortKey?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  search: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  firstItem?: number;
  lastItem?: number;
  sortColumn: string;
  sortDirection: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleApi {
  private readonly http = inject(HttpClient);

  getManufacturers(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>('/api/manufacturers');
  }

  addVehicle(vehicle: VehicleRequest): Observable<unknown> {
    return this.http.post('/api/vehicles', vehicle);
  }

  getVehicles(
    search = '',
    page = 1,
    sortColumn = 'owner',
    sortDirection = 'asc'
  ): Observable<VehicleListResponse> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('sortColumn', sortColumn)
      .set('sortDirection', sortDirection);

    return this.http.get<VehicleListResponse>(
      '/api/vehicles',
      { params }
    );
  }
}
