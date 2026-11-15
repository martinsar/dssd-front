// [Entrega final] Pantalla del Centro Coordinador: seguimiento de una emergencia y decisión ante cobertura insuficiente
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoordinadorService } from '../../../services/coordinador';
import { ConvocatoriaService } from '../../../services/convocatoria';
import { AccionConvocatoria, DecisionConvocatoriaRequest } from '../../../models/convocatoria.model';
import { SeguimientoEmergencia as Seguimiento } from '../../../models/monitoreo.model';
import { TipoRecurso } from '../../../models/necesidad.model';
import { esNoEncontrado, mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import { aIsoLocal } from '../../../shared/fechas';
import {
  CLASE_ESTADO_OFERTA,
  CLASE_ETAPA,
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_ETAPA,
  PASOS_STEPPER,
  indiceEtapa
} from '../../../shared/etiquetas';

@Component({
  selector: 'app-seguimiento-emergencia',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './seguimiento-emergencia.html'
})
export class SeguimientoEmergencia implements OnInit {
  private fb = inject(FormBuilder);
  private coordinador = inject(CoordinadorService);
  private convocatorias = inject(ConvocatoriaService);
  private route = inject(ActivatedRoute);

  readonly claseGravedad = claseGravedad;
  readonly claseEtapa = CLASE_ETAPA;
  readonly etiquetaEtapa = ETIQUETA_ETAPA;
  readonly claseEstado = CLASE_ESTADO_OFERTA;
  readonly etiquetaEstado = ETIQUETA_ESTADO_OFERTA;
  readonly pasos = PASOS_STEPPER;

  private id = Number(this.route.snapshot.paramMap.get('id'));

  datos = signal<Seguimiento | null>(null);
  tiposRecurso = signal<TipoRecurso[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  noEncontrada = signal(false);

  // Decisión del coordinador
  accion = signal<AccionConvocatoria>('REABRIR');
  confirmandoParcial = signal(false);
  enviando = signal(false);
  errorDecision = signal<string | null>(null);
  exito = signal<string | null>(null);

  fechaCierre = new FormControl('', { nonNullable: true });
  lotesForm = this.fb.group({ lotes: this.fb.array<FormGroup>([]) });

  get lotes(): FormArray<FormGroup> {
    return this.lotesForm.controls.lotes;
  }

  indice = computed(() => {
    const d = this.datos();
    return d ? indiceEtapa(d.emergencia.etapa) : -1;
  });

  // Ofertas que ya están en ejecución o terminadas
  adjudicadas = computed(() =>
    (this.datos()?.ofertas ?? []).filter(o => o.estado === 'ADJUDICADA' || o.estado === 'FINALIZADA')
  );
  finalizadas = computed(() => this.adjudicadas().filter(o => o.estado === 'FINALIZADA').length);
  progreso = computed(() => {
    const total = this.adjudicadas().length;
    return total === 0 ? 0 : Math.round((100 * this.finalizadas()) / total);
  });

  ngOnInit(): void {
    this.cargar();
  }

  // Se llama a la API para obtener el seguimiento completo
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noEncontrada.set(false);
    this.coordinador.seguimiento(this.id).subscribe({
      next: d => {
        this.datos.set(d);
        this.cargando.set(false);
        if (d.emergencia.puedeDecidir) {
          this.prepararDecision();
        }
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

  // Se precargan los lotes actuales para poder reformularlos
  private prepararDecision(): void {
    this.lotes.clear();
    for (const l of this.datos()?.emergencia.lotes ?? []) {
      this.lotes.push(this.nuevoLote(l.tipoRecursoId, l.cantidadRequerida, l.descripcion));
    }
    if (this.tiposRecurso().length === 0) {
      this.convocatorias.tiposRecurso().subscribe({
        next: tipos => this.tiposRecurso.set(tipos),
        error: err => this.errorDecision.set(mensajeDeError(err))
      });
    }
  }

  private nuevoLote(tipoRecursoId: number | null, cantidad: number, descripcion: string): FormGroup {
    return this.fb.group({
      tipoRecursoId: [tipoRecursoId, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(1)]],
      descripcion: [descripcion, Validators.required]
    });
  }

  elegirAccion(accion: AccionConvocatoria): void {
    this.accion.set(accion);
    this.confirmandoParcial.set(false);
    this.errorDecision.set(null);
  }

  agregarLote(): void {
    this.lotes.push(this.nuevoLote(null, 1, ''));
  }

  quitarLote(i: number): void {
    if (this.lotes.length > 1) {
      this.lotes.removeAt(i);
    }
  }

  // Se valida y se envía la decisión elegida
  aplicar(): void {
    if (this.enviando()) {
      return;
    }
    this.errorDecision.set(null);
    this.exito.set(null);
    const accion = this.accion();
    const convocatoriaId = this.datos()?.emergencia.convocatoria?.id;
    if (!convocatoriaId) {
      this.errorDecision.set('La emergencia no tiene una convocatoria para decidir.');
      return;
    }
    if (accion === 'CONTINUAR_PARCIAL' && !this.confirmandoParcial()) {
      this.confirmandoParcial.set(true);
      return;
    }

    let req: DecisionConvocatoriaRequest = { accion, fechaCierre: null, necesidades: null };
    if (accion !== 'CONTINUAR_PARCIAL') {
      const cierre = this.fechaCierre.value;
      if (!cierre) {
        this.errorDecision.set('Elegí la nueva fecha y hora de cierre.');
        return;
      }
      if (new Date(cierre) <= new Date()) {
        this.errorDecision.set('La nueva fecha de cierre tiene que ser futura.');
        return;
      }
      req = { ...req, fechaCierre: aIsoLocal(cierre) };
    }
    if (accion === 'REFORMULAR') {
      if (this.lotesForm.invalid) {
        this.lotesForm.markAllAsTouched();
        this.errorDecision.set('Completá todos los lotes: tipo de recurso, cantidad (mínimo 1) y descripción.');
        return;
      }
      req = {
        ...req,
        necesidades: this.lotes.controls.map(g => ({
          tipoRecursoId: Number(g.value['tipoRecursoId']),
          cantidad: Number(g.value['cantidad']),
          descripcion: String(g.value['descripcion'])
        }))
      };
    }

    this.enviando.set(true);
    this.coordinador.decidir(convocatoriaId, req).subscribe({
      next: () => {
        this.enviando.set(false);
        this.confirmandoParcial.set(false);
        this.fechaCierre.setValue('');
        this.exito.set(this.textoExito(accion));
        this.cargar();
      },
      error: err => {
        this.enviando.set(false);
        this.confirmandoParcial.set(false);
        this.errorDecision.set(mensajeDeError(err));
      }
    });
  }

  cancelarConfirmacion(): void {
    this.confirmandoParcial.set(false);
  }

  private textoExito(accion: AccionConvocatoria): string {
    switch (accion) {
      case 'REABRIR':
        return 'Convocatoria reabierta. Las organizaciones fueron notificadas.';
      case 'REFORMULAR':
        return 'Lotes reformulados y convocatoria reabierta. Las organizaciones fueron notificadas.';
      default:
        return 'Se continúa con la cobertura parcial.';
    }
  }
}
