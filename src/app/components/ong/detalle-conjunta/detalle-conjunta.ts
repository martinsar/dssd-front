// [Entrega final] Pantalla de la ONG: detalle de una oferta conjunta
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OngService } from '../../../services/ong';
import { OfertaConjuntaOng } from '../../../models/oferta.model';
import { esNoEncontrado, mensajeDeError } from '../../../shared/api-error';
import { CLASE_ESTADO_OFERTA, ETIQUETA_ESTADO_OFERTA } from '../../../shared/etiquetas';

@Component({
  selector: 'app-detalle-conjunta',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './detalle-conjunta.html'
})
export class DetalleConjunta implements OnInit {
  private ong = inject(OngService);
  private route = inject(ActivatedRoute);

  readonly claseEstado = CLASE_ESTADO_OFERTA;
  readonly etiquetaEstado = ETIQUETA_ESTADO_OFERTA;

  private id = Number(this.route.snapshot.paramMap.get('id'));
  readonly recienCreada = this.route.snapshot.queryParamMap.get('creada') === '1';

  conjunta = signal<OfertaConjuntaOng | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  noEncontrada = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.noEncontrada.set(false);
    this.ong.ofertaConjunta(this.id).subscribe({
      next: c => {
        this.conjunta.set(c);
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
}
