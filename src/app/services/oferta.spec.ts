import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Oferta } from './oferta';

describe('Oferta', () => {
  let service: Oferta;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Oferta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
