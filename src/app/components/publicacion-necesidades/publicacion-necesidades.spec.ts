import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicacionNecesidades } from './publicacion-necesidades';

describe('PublicacionNecesidades', () => {
  let component: PublicacionNecesidades;
  let fixture: ComponentFixture<PublicacionNecesidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionNecesidades],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionNecesidades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
