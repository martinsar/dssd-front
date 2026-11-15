import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MisEmergencias } from './mis-emergencias';

describe('MisEmergencias', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [MisEmergencias],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(MisEmergencias);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
