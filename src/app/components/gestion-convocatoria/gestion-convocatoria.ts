// [Entrega 2 · Tarea 4] ARCHIVO NUEVO.
// Pantalla del coordinador: elegir emergencia -> relevamiento (varios lotes) -> publicación.
// Diagrama: docs/diagramas/04-pantalla-coordinador.svg (repo del backend).
//
// Dos conceptos clave:
//  - La app es "zoneless" (sin zone.js): Angular NO detecta cambios en variables comunes asignadas
//    dentro de un subscribe. Por eso todo el estado que llega por HTTP vive en signals:
//    se crea con signal(...), se cambia con .set(...) y se lee en el HTML como emergencias().
//  - FormArray: la lista dinámica de lotes. Cada lote es un FormGroup (tipo, cantidad, descripción);
//    "+ Agregar lote" hace push y la ✕ hace removeAt(i).
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConvocatoriaService, LoteRequest } from '../../services/convocatoria';

// Los tres pasos de la pantalla (ver diagrama)
type Paso = 'lista' | 'relevamiento' | 'publicacion';

@Component({
  selector: 'app-gestion-convocatoria',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-convocatoria.html',
  styleUrl: './gestion-convocatoria.scss'
})
export class GestionConvocatoria implements OnInit {
  private fb = inject(FormBuilder);
  private convocatoriaService = inject(ConvocatoriaService);

  // ---- Estado de la pantalla (signals, por ser zoneless) ----
  paso = signal<Paso>('lista');
  emergencias = signal<any[]>([]);
  tiposRecurso = signal<any[]>([]);
  emergenciaSeleccionada = signal<any | null>(null);
  convocatoria = signal<any | null>(null);   // la convocatoria en BORRADOR que se va a publicar
  lotesRelevados = signal<any[]>([]);        // lotes ya guardados (solo lectura en el paso 3)
  cargando = signal(false);                  // true mientras hay un pedido en curso (Bonita puede tardar unos segundos)
  error = signal<string | null>(null);
  mensajeOk = signal<string | null>(null);

  // Valor derivado: se recalcula solo cuando cambia tiposRecurso
  sinTiposRecurso = computed(() => this.tiposRecurso().length === 0);

  // ---- Formularios ----
  // Paso 2: un FormArray con un FormGroup por lote
  relevamientoForm = this.fb.group({
    lotes: this.fb.array<FormGroup>([])
  });

  // Paso 3: la ventana de tiempo. La apertura es opcional (el backend usa "ahora" si viene vacía)
  publicacionForm = this.fb.group({
    fechaApertura: [''],
    fechaCierre: ['', Validators.required]
  });

  get lotes(): FormArray<FormGroup> {
    return this.relevamientoForm.controls.lotes;
  }

  ngOnInit(): void {
    this.cargarPendientes();
    this.convocatoriaService.tiposRecurso().subscribe({
      next: tipos => this.tiposRecurso.set(tipos),
      error: err => this.mostrarError(err)
    });
  }

  // ---------------- Paso 1: elegir emergencia ----------------

  cargarPendientes(): void {
    this.convocatoriaService.emergenciasPendientes().subscribe({
      next: lista => this.emergencias.set(lista),
      error: err => this.mostrarError(err)
    });
  }

  // Al elegir una emergencia: si ya tiene una convocatoria en BORRADOR (relevamiento hecho),
  // va directo a publicar; si no, arranca el relevamiento.
  seleccionar(emergencia: any): void {
    this.limpiarMensajes();
    this.emergenciaSeleccionada.set(emergencia);
    this.cargando.set(true);
    this.convocatoriaService.convocatoriasDeEmergencia(emergencia.id).subscribe({
      next: convocatorias => {
        const borrador = convocatorias.find(c => c.estado === 'BORRADOR');
        if (borrador) {
          this.irAPublicacion(borrador);
        } else {
          this.iniciarRelevamiento();
          this.cargando.set(false);
        }
      },
      error: err => this.mostrarError(err)
    });
  }

  volverALista(): void {
    this.limpiarMensajes();
    this.emergenciaSeleccionada.set(null);
    this.convocatoria.set(null);
    this.paso.set('lista');
    this.cargarPendientes();
  }

  // ---------------- Paso 2: relevamiento (tarea "Desglosar Lotes") ----------------

  private iniciarRelevamiento(): void {
    this.lotes.clear();
    this.agregarLote();   // arranca con un lote vacío
    this.paso.set('relevamiento');
  }

  agregarLote(): void {
    this.lotes.push(this.fb.group({
      tipoRecursoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required]
    }));
  }

  quitarLote(i: number): void {
    // Siempre queda al menos un lote
    if (this.lotes.length > 1) {
      this.lotes.removeAt(i);
    }
  }

  guardarRelevamiento(): void {
    this.limpiarMensajes();
    if (this.relevamientoForm.invalid) {
      this.relevamientoForm.markAllAsTouched();
      this.error.set('Completá todos los lotes: tipo de recurso, cantidad (mínimo 1) y descripción.');
      return;
    }
    // Armamos el body como lo espera el backend: tipoRecursoId como número plano
    const lotes: LoteRequest[] = this.lotes.controls.map(g => ({
      tipoRecursoId: Number(g.value.tipoRecursoId),
      cantidad: Number(g.value.cantidad),
      descripcion: g.value.descripcion
    }));
    const emergencia = this.emergenciaSeleccionada();
    this.cargando.set(true);
    this.convocatoriaService.crearRelevamiento(emergencia.id, lotes).subscribe({
      next: convocatoria => {
        this.mensajeOk.set(`Relevamiento guardado: convocatoria #${convocatoria.id} con ${lotes.length} lote(s).`);
        this.irAPublicacion(convocatoria);
      },
      error: err => this.mostrarError(err)
    });
  }

  // ---------------- Paso 3: publicación formal (tarea "Gestionar Convocatoria") ----------------

  private irAPublicacion(convocatoria: any): void {
    this.convocatoria.set(convocatoria);
    this.publicacionForm.reset({ fechaApertura: '', fechaCierre: '' });
    this.convocatoriaService.lotesDeConvocatoria(convocatoria.id).subscribe({
      next: lotes => {
        this.lotesRelevados.set(lotes);
        this.paso.set('publicacion');
        this.cargando.set(false);
      },
      error: err => this.mostrarError(err)
    });
  }

  publicar(): void {
    this.limpiarMensajes();
    const { fechaApertura, fechaCierre } = this.publicacionForm.value;
    if (!fechaCierre) {
      this.error.set('La fecha de cierre es obligatoria.');
      return;
    }
    if (new Date(fechaCierre) <= new Date()) {
      this.error.set('La fecha de cierre tiene que ser futura.');
      return;
    }
    const convocatoria = this.convocatoria();
    this.cargando.set(true);
    this.convocatoriaService.publicar(
      convocatoria.id,
      fechaApertura ? this.aIso(fechaApertura) : null,
      this.aIso(fechaCierre)
    ).subscribe({
      next: publicada => {
        this.cargando.set(false);
        this.volverALista();
        this.mensajeOk.set(`Convocatoria #${publicada.id} publicada. Las ONGs ya pueden cargar ofertas.`);
      },
      error: err => this.mostrarError(err)
    });
  }

  // ---------------- Utilidades ----------------

  // El input datetime-local devuelve "2026-10-10T18:00"; el backend espera "2026-10-10T18:00:00"
  private aIso(valor: string): string {
    return valor.length === 16 ? `${valor}:00` : valor;
  }

  // El backend responde los errores como { "error": "mensaje" } (400 / 404 / 409 / 502)
  private mostrarError(err: any): void {
    this.cargando.set(false);
    this.error.set(err?.error?.error ?? 'No se pudo comunicar con el servidor.');
  }

  private limpiarMensajes(): void {
    this.error.set(null);
    this.mensajeOk.set(null);
  }
}
