// [Entrega final] Pantalla de la ONG: detalle de un lote e historial de versiones
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OngService } from '../../../services/ong';
import { OfertaOng, OfertaVersion } from '../../../models/oferta.model';
import { esNoEncontrado, mensajeDeError } from '../../../shared/api-error';
import { CLASE_ESTADO_OFERTA, ETIQUETA_ESTADO_OFERTA } from '../../../shared/etiquetas';

@Component({
  selector: 'app-detalle-oferta',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './detalle-oferta.html'
})
export class DetalleOferta implements OnInit {
  private fb = inject(FormBuilder);
  private ong = inject(OngService);
  private route = inject(ActivatedRoute);

  readonly claseEstado = CLASE_ESTADO_OFERTA;
  readonly etiquetaEstado = ETIQUETA_ESTADO_OFERTA;

  private id = Number(this.route.snapshot.paramMap.get('id'));
  readonly recienCreada = this.route.snapshot.queryParamMap.get('creada') === '1';
  private avisoFuera = this.route.snapshot.queryParamMap.get('fuera') === '1';

  oferta = signal<OfertaOng | null>(null);
  versiones = signal<OfertaVersion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  noEncontrada = signal(false);

  // Estado de las acciones
  accionEnCurso = signal(false);
  errorAccion = signal<string | null>(null);
  confirmandoRetiro = signal(false);
  finalizando = signal(false);
  informe = this.fb.nonNullable.control('', Validators.maxLength(500));

  ngOnInit(): void {
    this.cargar();
  }

  // Se informa si hay que avisar que el recurso está fuera de las especialidades
  mostrarAvisoEspecialidad(o: OfertaOng): boolean {
    return o.fueraDeEspecialidad || this.avisoFuera;
  }

  // Se cargan el lote y su historial
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noEncontrada.set(false);
    this.ong.oferta(this.id).subscribe({
      next: oferta => {
        this.oferta.set(oferta);
        this.cargando.set(false);
        this.cargarVersiones();
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

  private cargarVersiones(): void {
    this.ong.versiones(this.id).subscribe({
      next: lista => this.versiones.set(lista),
      error: () => undefined
    });
  }

  pedirRetiro(): void {
    this.confirmandoRetiro.set(true);
  }

  cancelarRetiro(): void {
    this.confirmandoRetiro.set(false);
  }

  retirar(): void {
    if (this.accionEnCurso()) {
      return;
    }
    this.errorAccion.set(null);
    this.accionEnCurso.set(true);
    this.ong.retirar(this.id).subscribe({
      next: oferta => {
        this.accionEnCurso.set(false);
        this.confirmandoRetiro.set(false);
        this.oferta.set(oferta);
        this.cargarVersiones();
      },
      error: err => {
        this.confirmandoRetiro.set(false);
        this.alFallar(err);
      }
    });
  }

  abrirFinalizacion(): void {
    this.finalizando.set(true);
  }

  cancelarFinalizacion(): void {
    this.finalizando.set(false);
  }

  finalizar(): void {
    if (this.accionEnCurso()) {
      return;
    }
    if (this.informe.invalid) {
      this.errorAccion.set('El informe no puede superar los 500 caracteres.');
      return;
    }
    this.errorAccion.set(null);
    this.accionEnCurso.set(true);
    this.ong.finalizar(this.id, this.informe.value.trim()).subscribe({
      next: oferta => {
        this.accionEnCurso.set(false);
        this.finalizando.set(false);
        this.oferta.set(oferta);
        this.cargarVersiones();
      },
      error: err => this.alFallar(err)
    });
  }

  private alFallar(err: unknown): void {
    this.accionEnCurso.set(false);
    this.errorAccion.set(mensajeDeError(err));
  }
}
