
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { VehicleApi, Manufacturer } from '../services/vehicle-api';

@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-vehicle.html',
  styleUrl: './add-vehicle.css'
})
export class AddVehicle implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VehicleApi);

  manufacturers: Manufacturer[] = [];
  loadingManufacturers = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  currentYear = new Date().getFullYear();

  vehicleForm = this.fb.group({
    ownerName: [
      '',
      [Validators.required, Validators.maxLength(100)]
    ],
    manufacturerId: [
      null as number | null,
      Validators.required
    ],
    yearOfManufacture: [
      this.currentYear,
      [
        Validators.required,
        Validators.min(1886),
        Validators.max(2100)
      ]
    ],
    weightKg: [
      null as number | null,
      [Validators.required, Validators.min(0.01)]
    ]
  });

  ngOnInit(): void {
    this.loadManufacturers();
  }

  loadManufacturers(): void {
    this.loadingManufacturers = true;
    this.errorMessage = '';

    this.api.getManufacturers().pipe(
      timeout(10000),
      finalize(() => {
        this.loadingManufacturers = false;
      })
    ).subscribe({
      next: (manufacturers) => {
        this.manufacturers = manufacturers ?? [];

        if (this.manufacturers.length === 0) {
          this.errorMessage = 'No manufacturers are available.';
        }
      },
      error: (error: unknown) => {
        console.error('Manufacturer API error:', error);

        if (
          typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          error.name === 'TimeoutError'
        ) {
          this.errorMessage =
            'Loading manufacturers timed out. Please try again.';
        } else {
          this.errorMessage =
            'Could not load manufacturers. Please check the .NET API and try again.';
        }
      }
    });
  }

  clearForm(): void {
    this.vehicleForm.reset({
      ownerName: '',
      manufacturerId: null,
      yearOfManufacture: this.currentYear,
      weightKg: null
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  submit(): void {
    if (this.saving || this.loadingManufacturers) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const value = this.vehicleForm.getRawValue();

    if (
      value.manufacturerId === null ||
      value.weightKg === null ||
      value.yearOfManufacture === null
    ) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    const ownerName = value.ownerName?.trim() ?? '';

    if (!ownerName) {
      this.vehicleForm.controls.ownerName.setValue('');
      this.vehicleForm.controls.ownerName.markAsTouched();
      this.errorMessage = 'Owner name is required.';
      return;
    }

    this.saving = true;

    this.api.addVehicle({
      ownerName,
      manufacturerId: value.manufacturerId,
      yearOfManufacture: value.yearOfManufacture,
      weightKg: value.weightKg
    }).pipe(
      timeout(15000),
      finalize(() => {
        this.saving = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Vehicle added successfully!';

        this.vehicleForm.reset({
          ownerName: '',
          manufacturerId: null,
          yearOfManufacture: this.currentYear,
          weightKg: null
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Add vehicle API error:', error);

        if (error.name === 'TimeoutError') {
          this.errorMessage =
            'The request took too long. Check the vehicle list before retrying.';
          return;
        }

        this.errorMessage = this.getApiErrorMessage(error);
      }
    });
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    const apiError: unknown = error.error;

    if (typeof apiError === 'string' && apiError.trim()) {
      return apiError;
    }

    if (typeof apiError === 'object' && apiError !== null) {
      const body = apiError as {
        title?: unknown;
        message?: unknown;
        errors?: unknown;
      };

      if (
        typeof body.errors === 'object' &&
        body.errors !== null
      ) {
        const messages = Object.values(
          body.errors as Record<string, unknown>
        ).flatMap((item) =>
          Array.isArray(item) ? item : [item]
        ).filter(
          (item): item is string => typeof item === 'string'
        );

        if (messages.length > 0) {
          return messages.join(' ');
        }
      }

      if (typeof body.message === 'string') {
        return body.message;
      }

      if (typeof body.title === 'string') {
        return body.title;
      }
    }

    if (error.status === 0) {
      return 'Cannot connect to the API. Check that the .NET backend is running.';
    }

    return `Could not save the vehicle. HTTP ${error.status}. Please check your details and try again.`;
  }
}
