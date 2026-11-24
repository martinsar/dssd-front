// [Entrega final] Gráfico de barras horizontales con HTML y CSS
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface DatoBarra {
  etiqueta: string;
  valor: number;
  clave?: string;
}

@Component({
  selector: 'app-grafico-barras',
  standalone: true,
  templateUrl: './grafico-barras.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraficoBarras {
  datos = input.required<DatoBarra[]>();
  titulo = input('');
  unidad = input('');
  seleccionada = input<string | null>(null);
  seleccion = output<string>();

  private maximo = computed(() => Math.max(1, ...this.datos().map(d => d.valor)));

  // Se calcula el ancho de la barra en porcentaje
  ancho(valor: number): number {
    return Math.round((valor / this.maximo()) * 100);
  }

  // Se informa la barra elegida
  elegir(dato: DatoBarra): void {
    this.seleccion.emit(dato.clave ?? dato.etiqueta);
  }
}
