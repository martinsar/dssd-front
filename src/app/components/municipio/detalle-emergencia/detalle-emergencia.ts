// [Entrega final] Pantalla del Municipio: detalle de la emergencia y selección de ofertas
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MunicipioService } from '../../../services/municipio';
import { EmergenciaDetalle } from '../../../models/emergencia.model';
import { AdjudicacionResponse, OfertaValidada } from '../../../models/oferta.model';
import { esNoEncontrado, mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import {
  CLASE_ESTADO_OFERTA,
  CLASE_ETAPA,
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_ETAPA,
  PASOS_STEPPER,
  etiquetaEtapa,
  indiceEtapa
} from '../../../shared/etiquetas';

interface CoberturaLote {
  tipoRecurso: string;
  requerida: number;
  seleccionada: number;
}

@Component({
  selector: 'app-detalle-emergencia',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './detalle-emergencia.html'
})
export class DetalleEmergencia implements OnInit {
  private municipio = inject(MunicipioService);
  private route = inject(ActivatedRoute);

  readonly claseGravedad = claseGravedad;
  readonly claseEtapa = CLASE_ETAPA;
  readonly etiquetaEtapa = ETIQUETA_ETAPA;
  readonly claseEstado = CLASE_ESTADO_OFERTA;
  readonly etiquetaEstado = ETIQUETA_ESTADO_OFERTA;
  readonly pasos = PASOS_STEPPER;
  readonly nombreEtapa = etiquetaEtapa;

  private id = Number(this.route.snapshot.paramMap.get('id'));

  detalle = signal<EmergenciaDetalle | null>(null);
  ofertas = signal<OfertaValidada[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  noEncontrada = signal(false);
  errorOfertas = signal<string | null>(null);

  seleccion = signal<ReadonlySet<number>>(new Set<number>());
  confirmando = signal(false);
  enviando = signal(false);
  errorSeleccion = signal<string | null>(null);
  resultado = signal<AdjudicacionResponse | null>(null);

  indice = computed(() => {
    const d = this.detalle();
    return d ? indiceEtapa(d.etapa) : -1;
  });

  // Ofertas que se pueden elegir (solo las validadas)
  elegibles = computed(() => this.ofertas().filter(o => o.estado === 'VALIDADA'));

  cantidadElegidas = computed(() => this.seleccion().size);
  cantidadExcluidas = computed(() => this.elegibles().length - this.seleccion().size);

  // Cobertura en vivo por lote según lo marcado
  cobertura = computed<CoberturaLote[]>(() => {
    const d = this.detalle();
    if (!d) {
      return [];
    }
    const elegidas = this.ofertas().filter(o => this.seleccion().has(o.id));
    return d.lotes.map(l => ({
      tipoRecurso: l.tipoRecurso,
      requerida: l.cantidadRequerida,
      seleccionada: elegidas.filter(o => o.tipoRecursoId === l.tipoRecursoId).reduce((suma, o) => suma + o.cantidad, 0)
    }));
  });

  ngOnInit(): void {
    this.cargar();
  }

  // Se cargan el detalle y las ofertas validadas
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noEncontrada.set(false);
    this.municipio.detalle(this.id).subscribe({
      next: d => {
        this.detalle.set(d);
        this.cargando.set(false);
        this.cargarOfertas();
      },
      error: err => {
        if (esNoEncontrado(err)) {
          this.noEncontrada.set(true);
        } else {
          this.error.set(mensajeDeError(err));
        }
        this.cargando.set(false);
      }
    });
  }

  cargarOfertas(): void {
    this.errorOfertas.set(null);
    this.municipio.ofertasValidadas(this.id).subscribe({
      next: lista => this.ofertas.set(lista),
      error: err => this.errorOfertas.set(mensajeDeError(err))
    });
  }

  alternar(ofertaId: number): void {
    const nueva = new Set(this.seleccion());
    if (nueva.has(ofertaId)) {
      nueva.delete(ofertaId);
    } else {
      nueva.add(ofertaId);
    }
    this.seleccion.set(nueva);
    this.confirmando.set(false);
  }

  estaElegida(ofertaId: number): boolean {
    return this.seleccion().has(ofertaId);
  }

  // Se pide la confirmación antes de enviar
  pedirConfirmacion(): void {
    this.errorSeleccion.set(null);
    if (this.seleccion().size === 0) {
      this.errorSeleccion.set('Elegí al menos una oferta.');
      return;
    }
    this.confirmando.set(true);
  }

  cancelarConfirmacion(): void {
    this.confirmando.set(false);
  }

  // Se registra la selección de ofertas
  confirmar(): void {
    if (this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.errorSeleccion.set(null);
    this.municipio.adjudicar(this.id, [...this.seleccion()]).subscribe({
      next: res => {
        this.enviando.set(false);
        this.confirmando.set(false);
        this.resultado.set(res);
        this.seleccion.set(new Set<number>());
        this.cargar();
      },
      error: err => {
        this.enviando.set(false);
        this.confirmando.set(false);
        this.errorSeleccion.set(mensajeDeError(err));
      }
    });
  }
}
