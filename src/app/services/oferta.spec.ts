import { TestBed } from '@angular/core/testing';
import { Oferta } from './oferta';

describe('Oferta', () => {
  let service: Oferta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Oferta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
