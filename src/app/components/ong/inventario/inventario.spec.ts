import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Inventario } from './inventario';

describe('Inventario', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [Inventario],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Inventario);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
