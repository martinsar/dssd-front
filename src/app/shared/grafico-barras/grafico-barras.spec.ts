import { TestBed } from '@angular/core/testing';
import { GraficoBarras } from './grafico-barras';

describe('GraficoBarras', () => {
  it('muestra una barra por dato y emite la clave al elegirla', async () => {
    await TestBed.configureTestingModule({ imports: [GraficoBarras] }).compileComponents();
    const fixture = TestBed.createComponent(GraficoBarras);
    fixture.componentRef.setInput('datos', [
      { etiqueta: 'Agua', valor: 10 },
      { etiqueta: 'Frazadas', valor: 5, clave: 'FRAZ' }
    ]);
    await fixture.whenStable();

    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('button.bar-row');
    expect(botones.length).toBe(2);

    const elegidas: string[] = [];
    fixture.componentInstance.seleccion.subscribe(v => elegidas.push(v));
    (botones[1] as HTMLButtonElement).click();
    expect(elegidas).toEqual(['FRAZ']);
  });
});
