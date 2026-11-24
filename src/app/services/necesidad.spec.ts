import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Necesidad } from './necesidad';

describe('Necesidad', () => {
  let service: Necesidad;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Necesidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
