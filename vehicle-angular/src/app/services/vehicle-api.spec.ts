import { TestBed } from '@angular/core/testing';
import { VehicleApi } from './vehicle-api';

describe('VehicleApi', () => {
  let service: VehicleApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
