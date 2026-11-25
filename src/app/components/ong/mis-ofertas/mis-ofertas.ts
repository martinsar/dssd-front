// [Entrega final] Pantalla de la ONG: mis ofertas agrupadas por situación
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OngService } from '../../../services/ong';
import { EstadoOferta, OfertaOng } from '../../../models/oferta.model';
import { mensajeDeError } from '../../../shared/api-error';
import { CLASE_ESTADO_OFERTA, ETIQUETA_ESTADO_OFERTA } from '../../../shared/etiquetas';

type Pestana = 'activas' | 'adjudicadas' | 'historial';

const ESTADOS_ACTIVAS: EstadoOferta[] = ['PENDIENTE', 'VALIDADA', 'SELECCIONADA'];
const ESTADOS_ADJUDICADAS: EstadoOferta[] = ['ADJUDICADA'];
// [Entrega final] Estados de fin: el lote ya no cambia
const ESTADOS_HISTORIAL: EstadoOferta[] = ['FINALIZADA', 'NO_HABILITADA', 'NO_SELECCIONADA', 'RETIRADA'];

@Component({
  selector: 'app-mis-ofertas',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './mis-ofertas.html'
})
export class MisOfertas implements OnInit {
  private ong = inject(OngService);

  readonly claseEstado = CLASE_ESTADO_OFERTA;
  readonly etiquetaEstado = ETIQUETA_ESTADO_OFERTA;
  readonly pestanas: { clave: Pestana; etiqueta: string }[] = [
    { clave: 'activas', etiqueta: 'Activas' },
    { clave: 'adjudicadas', etiqueta: 'Adjudicadas' },
    { clave: 'historial', etiqueta: 'Historial' }
  ];

  ofertas = signal<OfertaOng[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  pestana = signal<Pestana>('activas');

  visibles = computed(() => this.filtrar(this.pestana()));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.ong.ofertas().subscribe({
      next: lista => {
        this.ofertas.set(lista);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  elegir(p: Pestana): void {
    this.pestana.set(p);
  }

  cantidad(p: Pestana): number {
    return this.filtrar(p).length;
  }

  private filtrar(p: Pestana): OfertaOng[] {
    return this.ofertas().filter(o => {
      if (p === 'activas') {
        return ESTADOS_ACTIVAS.includes(o.estado);
      }
      if (p === 'adjudicadas') {
        return ESTADOS_ADJUDICADAS.includes(o.estado);
      }
      return ESTADOS_HISTORIAL.includes(o.estado);
    });
  }
}
