
import { Routes } from '@angular/router';
import { AddVehicle } from './add-vehicle/add-vehicle';
import { VehicleList } from './vehicle-list/vehicle-list';

export const routes: Routes = [
  { path: '', redirectTo: 'add-vehicle', pathMatch: 'full' },
  { path: 'add-vehicle', component: AddVehicle },
  { path: 'vehicles', component: VehicleList }
];
