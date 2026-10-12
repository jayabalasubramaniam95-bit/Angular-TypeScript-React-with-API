
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

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
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  search: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
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
  ): Observable<VehicleListResponse | Vehicle[]> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('sortColumn', sortColumn)
      .set('sortDirection', sortDirection);

    return this.http.get<VehicleListResponse | Vehicle[]>(
      '/api/vehicles',
      { params }
    );
  }
}
