
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehicleApi, Vehicle, VehicleListResponse } from '../services/vehicle-api';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css'
})
export class VehicleList implements OnInit {
  private readonly api = inject(VehicleApi);

  vehicles: Vehicle[] = [];
  search = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  sortColumn = 'owner';
  sortDirection = 'asc';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadVehicles();
  }


loadVehicles(): void {
  this.loading = true;
  this.errorMessage = '';

  this.api.getVehicles(
    this.search,
    this.currentPage,
    this.sortColumn,
    this.sortDirection
  ).subscribe({
   next: (response: Vehicle[] | VehicleListResponse) => {
  const vehicleList = Array.isArray(response)
    ? response
    : response.vehicles;

  this.vehicles = vehicleList ?? [];
  this.totalItems = Array.isArray(response)
    ? response.length
    : response.totalItems;

  this.currentPage = Array.isArray(response)
    ? 1
    : response.currentPage;

  this.pageSize = Array.isArray(response)
    ? Math.max(response.length, 1)
    : response.pageSize;

  this.loading = false;
},
    error: (error) => {
      console.error('Vehicle API request failed:', error);

      this.errorMessage =
        `Could not load vehicles. HTTP status: ${error.status || 'Unknown'}.`;

      this.loading = false;
    }
  });
}


  searchVehicles(): void {
    this.currentPage = 1;
    this.loadVehicles();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
    this.loadVehicles();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVehicles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVehicles();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }
}
