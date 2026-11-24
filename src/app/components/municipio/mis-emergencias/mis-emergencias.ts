// [Entrega final] Pantalla del Municipio: lista de las emergencias registradas
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MunicipioService } from '../../../services/municipio';
import { EmergenciaResumen, EtapaEmergencia } from '../../../models/emergencia.model';
import { mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import { CLASE_ETAPA, ETIQUETA_ETAPA, ORDEN_ETAPAS } from '../../../shared/etiquetas';

@Component({
  selector: 'app-mis-emergencias',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './mis-emergencias.html'
})
export class MisEmergencias implements OnInit {
  private municipio = inject(MunicipioService);

  readonly claseGravedad = claseGravedad;
  readonly claseEtapa = CLASE_ETAPA;
  readonly etiquetaEtapa = ETIQUETA_ETAPA;

  emergencias = signal<EmergenciaResumen[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtro = signal<EtapaEmergencia | null>(null);

  // Solo se ofrecen como filtro las etapas que tienen emergencias
  etapasPresentes = computed(() => ORDEN_ETAPAS.filter(e => this.emergencias().some(x => x.etapa === e)));
  visibles = computed(() => {
    const f = this.filtro();
    return f ? this.emergencias().filter(e => e.etapa === f) : this.emergencias();
  });
  porSeleccionar = computed(() => this.emergencias().filter(e => e.etapa === 'EN_SELECCION').length);

  ngOnInit(): void {
    this.cargar();
  }

  // Se llama a la API para obtener las emergencias del usuario
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.municipio.misEmergencias().subscribe({
      next: lista => {
        this.emergencias.set(lista);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  filtrar(etapa: EtapaEmergencia | null): void {
    this.filtro.set(etapa);
  }
}
