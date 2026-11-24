// [Entrega final] Pantalla de la ONG: convocatorias abiertas a ofertas
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OngService } from '../../../services/ong';
import { ConvocatoriaAbierta } from '../../../models/convocatoria.model';
import { mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import { tiempoRestante } from '../../../shared/fechas';

@Component({
  selector: 'app-convocatorias-abiertas',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './convocatorias-abiertas.html'
})
export class ConvocatoriasAbiertas implements OnInit {
  private ong = inject(OngService);

  readonly claseGravedad = claseGravedad;
  readonly tiempoRestante = tiempoRestante;

  convocatorias = signal<ConvocatoriaAbierta[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.ong.convocatorias().subscribe({
      next: lista => {
        // [Entrega final] Solo se muestran las convocatorias que todavía reciben ofertas
        this.convocatorias.set(lista.filter(c => c.abierta && new Date(c.fechaCierre).getTime() > Date.now()));
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }
}
