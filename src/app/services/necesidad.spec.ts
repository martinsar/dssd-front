import { TestBed } from '@angular/core/testing';
import { Necesidad } from './necesidad';

describe('Necesidad', () => {
  let service: Necesidad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Necesidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
