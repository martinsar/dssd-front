// [Entrega final] Pantalla de la ONG: inventario de recursos
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { OngService } from '../../../services/ong';
import { InventarioItem } from '../../../models/inventario.model';
import { TipoRecurso } from '../../../models/necesidad.model';
import { mensajeDeError } from '../../../shared/api-error';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './inventario.html'
})
export class Inventario implements OnInit {
  private fb = inject(FormBuilder);
  private ong = inject(OngService);

  items = signal<InventarioItem[]>([]);
  tipos = signal<TipoRecurso[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  errorAccion = signal<string | null>(null);
  exito = signal<string | null>(null);
  enCurso = signal<number | 'nuevo' | null>(null);

  // Solo se pueden agregar los tipos que todavía no están cargados
  tiposDisponibles = computed(() => {
    const cargados = new Set(this.items().map(i => i.tipoRecursoId));
    return this.tipos().filter(t => !cargados.has(t.id));
  });

  form = this.fb.group({
    tipoRecursoId: [null as number | null, Validators.required],
    cantidadDisponible: [null as number | null, [Validators.required, Validators.min(0)]],
    descripcion: ['', Validators.maxLength(255)]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ items: this.ong.inventario(), tipos: this.ong.tiposRecurso() }).subscribe({
      next: ({ items, tipos }) => {
        this.items.set(items);
        this.tipos.set(tipos);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  libre(i: InventarioItem): number {
    return i.cantidadDisponible - i.cantidadComprometida;
  }

  // Se guarda la cantidad editada de una fila
  guardar(item: InventarioItem, valor: string): void {
    const cantidad = Number(valor);
    if (valor.trim() === '' || !Number.isInteger(cantidad) || cantidad < 0) {
      this.errorAccion.set('Ingresá una cantidad entera de 0 o más.');
      return;
    }
    this.enviar(item.tipoRecursoId, { cantidadDisponible: cantidad, descripcion: item.descripcion ?? '' }, item.tipoRecursoId, 'Inventario actualizado.');
  }

  agregar(): void {
    this.errorAccion.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.enviar(
      Number(v.tipoRecursoId),
      { cantidadDisponible: Number(v.cantidadDisponible), descripcion: (v.descripcion ?? '').trim() },
      'nuevo',
      'Recurso agregado al inventario.',
      () => this.form.reset({ tipoRecursoId: null, cantidadDisponible: null, descripcion: '' })
    );
  }

  quitar(item: InventarioItem): void {
    if (this.enCurso() !== null) {
      return;
    }
    this.errorAccion.set(null);
    this.exito.set(null);
    this.enCurso.set(item.tipoRecursoId);
    this.ong.quitarInventario(item.tipoRecursoId).subscribe({
      next: () => {
        this.items.update(l => l.filter(x => x.tipoRecursoId !== item.tipoRecursoId));
        this.enCurso.set(null);
        this.exito.set('Recurso quitado del inventario.');
      },
      error: err => {
        this.errorAccion.set(mensajeDeError(err));
        this.enCurso.set(null);
      }
    });
  }

  invalido(campo: 'tipoRecursoId' | 'cantidadDisponible' | 'descripcion'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  private enviar(
    tipoRecursoId: number,
    req: { cantidadDisponible: number; descripcion: string },
    marca: number | 'nuevo',
    mensaje: string,
    alTerminar?: () => void
  ): void {
    if (this.enCurso() !== null) {
      return;
    }
    this.errorAccion.set(null);
    this.exito.set(null);
    this.enCurso.set(marca);
    this.ong.guardarInventario(tipoRecursoId, req).subscribe({
      next: guardado => {
        this.items.update(lista => {
          const existe = lista.some(x => x.tipoRecursoId === guardado.tipoRecursoId);
          return existe
            ? lista.map(x => (x.tipoRecursoId === guardado.tipoRecursoId ? guardado : x))
            : [...lista, guardado].sort((a, b) => a.tipoRecurso.localeCompare(b.tipoRecurso));
        });
        this.enCurso.set(null);
        this.exito.set(mensaje);
        alTerminar?.();
      },
      error: err => {
        this.errorAccion.set(mensajeDeError(err));
        this.enCurso.set(null);
      }
    });
  }
}
