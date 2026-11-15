// [Entrega final] Pantalla del Centro Coordinador: monitoreo de emergencias
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoordinadorService } from '../../../services/coordinador';
import { EtapaEmergencia } from '../../../models/emergencia.model';
import { MonitoreoFila } from '../../../models/monitoreo.model';
import { mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import { CLASE_ETAPA, ETIQUETA_ETAPA, ORDEN_ETAPAS } from '../../../shared/etiquetas';

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './monitoreo.html'
})
export class Monitoreo implements OnInit {
  private coordinador = inject(CoordinadorService);

  readonly claseGravedad = claseGravedad;
  readonly claseEtapa = CLASE_ETAPA;
  readonly etiquetaEtapa = ETIQUETA_ETAPA;
  readonly etapas = ORDEN_ETAPAS;

  filas = signal<MonitoreoFila[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  etapa = signal<EtapaEmergencia | ''>('');

  // Los indicadores resumen se calculan sobre lo que se está mostrando
  abiertas = computed(() => this.filas().filter(f => f.etapa === 'CONVOCATORIA_ABIERTA').length);
  requierenDecision = computed(() => this.filas().filter(f => f.requiereDecision));
  enEjecucion = computed(() => this.filas().filter(f => f.etapa === 'EN_EJECUCION').length);
  finalizadas = computed(() => this.filas().filter(f => f.etapa === 'FINALIZADA').length);

  ngOnInit(): void {
    this.cargar();
  }

  // Se llama a la API (filtrando por etapa en el servidor)
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.coordinador.monitoreo(this.etapa()).subscribe({
      next: lista => {
        this.filas.set(lista);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  cambiarEtapa(valor: string): void {
    this.etapa.set(valor as EtapaEmergencia | '');
    this.cargar();
  }

  // Antes de publicar la convocatoria la acción es relevar
  esRelevamiento(f: MonitoreoFila): boolean {
    return f.etapa === 'EN_RELEVAMIENTO';
  }
}
