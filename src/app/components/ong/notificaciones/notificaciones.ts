// [Entrega final] Pantalla de la ONG: notificaciones
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionService } from '../../../services/notificacion';
import { Notificacion } from '../../../models/notificacion.model';
import { mensajeDeError } from '../../../shared/api-error';
import { ETIQUETA_TIPO_NOTIFICACION } from '../../../shared/etiquetas';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notificaciones.html'
})
export class Notificaciones implements OnInit {
  private servicio = inject(NotificacionService);
  private router = inject(Router);

  readonly etiquetaTipo = ETIQUETA_TIPO_NOTIFICACION;

  lista = signal<Notificacion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  errorAccion = signal<string | null>(null);
  marcando = signal(false);

  sinLeer = computed(() => this.lista().filter(n => !n.leida).length);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().subscribe({
      next: lista => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  // Se marca como leída y se navega a la pantalla relacionada
  abrir(n: Notificacion): void {
    const destino = this.destino(n);
    if (n.leida) {
      void this.router.navigateByUrl(destino);
      return;
    }
    this.servicio.marcarLeida(n.id).subscribe({
      next: () => {
        this.lista.update(l => l.map(x => (x.id === n.id ? { ...x, leida: true } : x)));
        this.servicio.refrescarNoLeidas();
        void this.router.navigateByUrl(destino);
      },
      error: err => this.errorAccion.set(mensajeDeError(err))
    });
  }

  // Se marca una notificación como leída sin salir de la lista
  marcarLeida(n: Notificacion): void {
    this.errorAccion.set(null);
    this.servicio.marcarLeida(n.id).subscribe({
      next: () => {
        this.lista.update(l => l.map(x => (x.id === n.id ? { ...x, leida: true } : x)));
        this.servicio.refrescarNoLeidas();
      },
      error: err => this.errorAccion.set(mensajeDeError(err))
    });
  }

  marcarTodas(): void {
    if (this.marcando()) {
      return;
    }
    this.marcando.set(true);
    this.errorAccion.set(null);
    this.servicio.marcarTodas().subscribe({
      next: () => {
        this.lista.update(l => l.map(x => ({ ...x, leida: true })));
        this.servicio.refrescarNoLeidas();
        this.marcando.set(false);
      },
      error: err => {
        this.errorAccion.set(mensajeDeError(err));
        this.marcando.set(false);
      }
    });
  }

  // Cada tipo lleva a su pantalla
  private destino(n: Notificacion): string {
    switch (n.tipo) {
      case 'NUEVA_CONVOCATORIA':
      case 'CONVOCATORIA_REABIERTA':
        return n.convocatoriaId ? `/ong/convocatorias/${n.convocatoriaId}/ofertar` : '/ong';
      default:
        return n.ofertaId ? `/ong/ofertas/${n.ofertaId}` : '/ong/ofertas';
    }
  }
}
