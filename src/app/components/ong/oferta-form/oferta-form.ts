// [Entrega final] Pantalla de la ONG: cargar un lote (solo o dentro de una oferta conjunta) y editarlo
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { OngService } from '../../../services/ong';
import { ConvocatoriaAbierta } from '../../../models/convocatoria.model';
import { InventarioItem } from '../../../models/inventario.model';
import { TipoRecurso } from '../../../models/necesidad.model';
import { EspecialidadOng, OfertaOng } from '../../../models/oferta.model';
import { esNoEncontrado, mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import { tiempoRestante } from '../../../shared/fechas';

@Component({
  selector: 'app-oferta-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './oferta-form.html'
})
export class OfertaForm implements OnInit {
  private fb = inject(FormBuilder);
  private ong = inject(OngService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly claseGravedad = claseGravedad;
  readonly tiempoRestante = tiempoRestante;

  // Si la ruta trae el id del lote se está editando; si no, se está creando
  private ofertaId = Number(this.route.snapshot.paramMap.get('id')) || null;
  private convocatoriaIdRuta = Number(this.route.snapshot.paramMap.get('convocatoriaId')) || null;
  // Si viene la oferta conjunta, el lote se carga dentro de ella
  readonly ofertaConjuntaId = Number(this.route.snapshot.queryParamMap.get('ofertaConjuntaId')) || null;
  readonly editando = this.ofertaId !== null;

  convocatoria = signal<ConvocatoriaAbierta | null>(null);
  oferta = signal<OfertaOng | null>(null);
  inventario = signal<InventarioItem[]>([]);
  tiposRecurso = signal<TipoRecurso[]>([]);
  especialidades = signal<EspecialidadOng[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  noEncontrada = signal(false);

  enviando = signal(false);
  errorEnvio = signal<string | null>(null);
  conflicto = signal(false);
  ventanaCerrada = signal(false);

  form = this.fb.group({
    tipoRecursoId: [null as number | null, Validators.required],
    cantidad: [null as number | null, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]]
  });

  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  // El formulario se bloquea si la ventana cerró o el lote ya no se puede editar
  bloqueado = computed(() => {
    if (this.ventanaCerrada()) {
      return true;
    }
    const o = this.oferta();
    if (this.editando) {
      return !!o && !o.puedeEditar;
    }
    const c = this.convocatoria();
    return !!c && !c.abierta;
  });

  // Aviso cuando el tipo elegido no está entre las especialidades de la ONG
  fueraDeEspecialidad = computed(() => {
    const id = Number(this.valores().tipoRecursoId);
    return id > 0 && this.especialidades().length > 0 && !this.especialidades().some(e => e.tipoRecursoId === id);
  });

  itemInventario = computed(() => {
    const id = this.valores().tipoRecursoId;
    return id ? (this.inventario().find(i => i.tipoRecursoId === Number(id)) ?? null) : null;
  });

  libre = computed(() => {
    const item = this.itemInventario();
    return item ? item.cantidadDisponible - item.cantidadComprometida : null;
  });

  // Aviso (sin bloquear) cuando la cantidad supera lo libre del inventario
  excedeInventario = computed(() => {
    const libre = this.libre();
    const cantidad = Number(this.valores().cantidad);
    return libre !== null && cantidad > 0 && cantidad > libre;
  });

  ngOnInit(): void {
    this.cargar();
  }

  // Se cargan la convocatoria, los tipos de recurso, el inventario y, si se edita, el lote
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noEncontrada.set(false);
    this.conflicto.set(false);
    this.ventanaCerrada.set(false);
    this.errorEnvio.set(null);

    const oferta$: Observable<OfertaOng | null> = this.ofertaId !== null ? this.ong.oferta(this.ofertaId) : of(null);
    oferta$
      .pipe(
        switchMap(oferta =>
          forkJoin({
            oferta: of(oferta),
            convocatorias: this.ong.convocatorias(),
            tipos: this.ong.tiposRecurso(),
            // Estos dos datos son de apoyo: si fallan no se bloquea la pantalla
            especialidades: this.ong.especialidades().pipe(catchError(() => of([] as EspecialidadOng[]))),
            inventario: this.ong.inventario().pipe(catchError(() => of([] as InventarioItem[])))
          })
        )
      )
      .subscribe({
        next: ({ oferta, convocatorias, tipos, especialidades, inventario }) => {
          const convocatoriaId = oferta ? oferta.convocatoriaId : this.convocatoriaIdRuta;
          const convocatoria = convocatorias.find(c => c.convocatoriaId === convocatoriaId) ?? null;
          if (!oferta && !convocatoria) {
            this.noEncontrada.set(true);
            this.cargando.set(false);
            return;
          }
          this.oferta.set(oferta);
          this.convocatoria.set(convocatoria);
          this.tiposRecurso.set(tipos);
          this.especialidades.set(especialidades);
          this.inventario.set(inventario);
          if (oferta) {
            this.form.reset({
              tipoRecursoId: oferta.tipoRecursoId,
              cantidad: oferta.cantidad,
              descripcion: oferta.descripcion
            });
          }
          if (this.bloqueado()) {
            this.form.disable({ emitEvent: false });
          } else {
            this.form.enable({ emitEvent: false });
          }
          this.cargando.set(false);
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

  invalido(campo: 'tipoRecursoId' | 'cantidad' | 'descripcion'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  // Se envía el alta o la edición del lote
  enviar(): void {
    if (this.enviando() || this.bloqueado()) {
      return;
    }
    this.errorEnvio.set(null);
    this.conflicto.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const base = {
      tipoRecursoId: Number(v.tipoRecursoId),
      cantidad: Number(v.cantidad),
      descripcion: (v.descripcion ?? '').trim()
    };
    this.enviando.set(true);

    if (this.ofertaId !== null) {
      const oferta = this.oferta();
      this.ong.editarOferta(this.ofertaId, { ...base, versionEsperada: oferta?.numeroVersion ?? 0 }).subscribe({
        next: editada => {
          this.enviando.set(false);
          void this.router.navigate(['/ong/ofertas', editada.id], { queryParams: editada.fueraDeEspecialidad ? { fuera: 1 } : {} });
        },
        error: err => this.alFallarEdicion(err)
      });
    } else {
      const req = { ...base, convocatoriaId: Number(this.convocatoriaIdRuta), ofertaConjuntaId: this.ofertaConjuntaId };
      this.ong.crearOferta(req).subscribe({
        next: creada => {
          this.enviando.set(false);
          const queryParams: Record<string, number> = { creada: 1 };
          if (creada.fueraDeEspecialidad) {
            queryParams['fuera'] = 1;
          }
          void this.router.navigate(['/ong/ofertas', creada.id], { queryParams });
        },
        error: err => {
          this.enviando.set(false);
          this.errorEnvio.set(mensajeDeError(err));
        }
      });
    }
  }

  // Un 409 puede ser por versión desactualizada o por ventana cerrada: se consulta el lote para distinguirlo
  private alFallarEdicion(err: unknown): void {
    this.errorEnvio.set(mensajeDeError(err));
    if (!(err instanceof HttpErrorResponse) || err.status !== 409 || this.ofertaId === null) {
      this.enviando.set(false);
      return;
    }
    this.ong.oferta(this.ofertaId).subscribe({
      next: actual => {
        this.enviando.set(false);
        if (!actual.ventanaAbierta || !actual.puedeEditar) {
          this.ventanaCerrada.set(true);
          this.form.disable({ emitEvent: false });
        } else {
          this.conflicto.set(true);
        }
      },
      error: () => {
        this.enviando.set(false);
        this.conflicto.set(true);
      }
    });
  }
}
