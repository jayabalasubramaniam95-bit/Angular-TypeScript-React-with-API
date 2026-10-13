
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import {
  VehicleApi,
  Vehicle,
  VehicleListResponse
} from '../services/vehicle-api';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css'
})
export class VehicleList implements OnInit {
  private readonly api = inject(VehicleApi);
  private readonly cdRef = inject(ChangeDetectorRef);

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
    this.cdRef.detectChanges();

    this.api.getVehicles(
      this.search,
      this.currentPage,
      this.sortColumn,
      this.sortDirection
    ).pipe(
      timeout(10000),
      finalize(() => {
        this.loading = false;
        this.cdRef.detectChanges();
      })
    ).subscribe({
      next: (response: VehicleListResponse) => {
        console.log('Vehicle API response:', response);

        this.vehicles = [...(response.vehicles ?? [])];
        this.totalItems = response.totalItems ?? this.vehicles.length;
        this.currentPage = response.currentPage ?? this.currentPage;
        this.pageSize = response.pageSize ?? 10;
        this.sortColumn = response.sortColumn ?? this.sortColumn;
        this.sortDirection = response.sortDirection ?? this.sortDirection;

        this.cdRef.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Failed to load vehicles:', error);

        this.vehicles = [];

        if (
          typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          error.name === 'TimeoutError'
        ) {
          this.errorMessage =
            'The vehicle API took too long to respond. Please try again.';
        } else {
          this.errorMessage =
            'Could not load vehicles. Please check the API and try again.';
        }

        this.cdRef.detectChanges();
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
    if (this.currentPage > 1 && !this.loading) {
      this.currentPage--;
      this.loadVehicles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.loading) {
      this.currentPage++;
      this.loadVehicles();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }
}
