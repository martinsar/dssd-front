// [Entrega final] Pantalla de la ONG: listado de ofertas conjuntas
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OngService } from '../../../services/ong';
import { OfertaConjuntaOng } from '../../../models/oferta.model';
import { mensajeDeError } from '../../../shared/api-error';

@Component({
  selector: 'app-conjuntas',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './conjuntas.html'
})
export class Conjuntas implements OnInit {
  private ong = inject(OngService);

  conjuntas = signal<OfertaConjuntaOng[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.ong.ofertasConjuntas().subscribe({
      next: lista => {
        this.conjuntas.set(lista);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }
}
