import { TestBed } from '@angular/core/testing';
import { Auditor } from './auditor';

describe('Auditor', () => {
  it('muestra el aviso', async () => {
    await TestBed.configureTestingModule({ imports: [Auditor] }).compileComponents();
    const fixture = TestBed.createComponent(Auditor);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Panel en preparación');
  });
});
