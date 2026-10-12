
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
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
    ownerName: ['', [Validators.required, Validators.maxLength(100)]],
    manufacturerId: [null as number | null, Validators.required],
    yearOfManufacture: [
      this.currentYear,
      [Validators.required, Validators.min(1886), Validators.max(2100)]
    ],
    weightKg: [
      null as number | null,
      [Validators.required, Validators.min(0.01)]
    ]
  });

  ngOnInit(): void {
    this.loadingManufacturers = true;

    this.api.getManufacturers().subscribe({
      next: (manufacturers) => {
        this.manufacturers = manufacturers;
        this.loadingManufacturers = false;
      },
      error: () => {
        this.errorMessage =
          'Could not load manufacturers. Check that the .NET API is running.';
        this.loadingManufacturers = false;
      }
    });
  }

  submit(): void {
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

    this.saving = true;

    this.api.addVehicle({
      ownerName: value.ownerName!.trim(),
      manufacturerId: value.manufacturerId,
      yearOfManufacture: value.yearOfManufacture,
      weightKg: value.weightKg
    }).subscribe({
      next: () => {
        this.successMessage = 'Vehicle added successfully!';
        this.vehicleForm.reset({
          ownerName: '',
          manufacturerId: null,
          yearOfManufacture: this.currentYear,
          weightKg: null
        });
        this.saving = false;
      },
      error: (error) => {
        const apiError = error.error;

        if (typeof apiError === 'string') {
          this.errorMessage = apiError;
        } else if (apiError?.errors) {
          this.errorMessage = Object.values(apiError.errors)
            .flat()
            .join(' ');
        } else {
          this.errorMessage =
            apiError?.message ||
            apiError?.title ||
            'Could not save the vehicle. Please check your details and try again.';
        }

        this.saving = false;
      }
    });
  }
}
