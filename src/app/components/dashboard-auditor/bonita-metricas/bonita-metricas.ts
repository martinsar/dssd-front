import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  ActividadUsuariosBonitaDto,
  CuellosDeBotellaBonitaDto,
  EstadosCasosBonitaDto,
  TiemposEsperaEjecucionBonitaDto,
  TiemposEtapasDto,
  TiemposResolucionCruzadosDto,
} from '../../../models/indicadores.model';

@Component({
  selector: 'app-bonita-metricas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bonita-metricas.html',
  styleUrl: './bonita-metricas.scss',
})
export class BonitaMetricasComponent {
  readonly estadosCasos = input.required<EstadosCasosBonitaDto>();
  readonly tiemposPorEtapa = input.required<TiemposEtapasDto>();
  readonly cuellosDeBotella = input.required<CuellosDeBotellaBonitaDto>();
  readonly esperaVsEjecucion = input.required<TiemposEsperaEjecucionBonitaDto>();
  readonly tiemposCruzados = input.required<TiemposResolucionCruzadosDto>();
  readonly actividadUsuarios = input.required<ActividadUsuariosBonitaDto>();

  readonly ringCircumference = 2 * Math.PI * 38;

  ringOffset(porcentaje: number | null | undefined): number {
    const pct = Math.max(0, Math.min(100, porcentaje ?? 0));
    return this.ringCircumference * (1 - pct / 100);
  }

  formatearHoras(horas: number | null | undefined): string {
    if (horas === null || horas === undefined || Number.isNaN(horas)) {
      return '—';
    }
    if (horas === 0) {
      return '0 h';
    }
    if (horas < 1) {
      return `${Math.round(horas * 60)} min`;
    }
    if (horas >= 48) {
      return `${(horas / 24).toFixed(1)} d (${horas.toFixed(1)} h)`;
    }
    return `${horas.toFixed(2)} h`;
  }

  porcentajeBarra(valor: number, maximo: number): number {
    if (!maximo || maximo <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round((valor / maximo) * 1000) / 10));
  }

  maxTiempoEtapa(): number {
    const lista = this.tiemposPorEtapa().etapas ?? [];
    return Math.max(0, ...lista.map((e) => e.maxHoras || e.promedioHoras || 0));
  }

  maxPendientes(): number {
    const lista = this.cuellosDeBotella().pendientesPorEtapa ?? [];
    return Math.max(0, ...lista.map((p) => p.cantidadPendientes));
  }

  maxTiempoGrupo(items: { promedioHoras: number; maxHoras: number }[]): number {
    return Math.max(0, ...items.map((i) => i.promedioHoras || 0));
  }

  maxTareasUsuario(): number {
    const lista = this.actividadUsuarios().usuarios ?? [];
    return Math.max(0, ...lista.map((u) => u.tareasCompletadas));
  }

  porcentajeEjecucion(porcentajeEspera: number | null | undefined): number {
    const espera = Math.max(0, Math.min(100, porcentajeEspera ?? 0));
    return Math.round((100 - espera) * 10) / 10;
  }

  claseFuente(fuente: string | null | undefined): string {
    if (!fuente) {
      return 'source-bonita';
    }
    if (fuente.includes('+')) {
      return 'source-combinada';
    }
    return fuente === 'DSSD_DB' ? 'source-dssd' : 'source-bonita';
  }

  claseEstadoActivacion(estado: string | null | undefined): string {
    const normalizado = (estado ?? '').toUpperCase();
    if (normalizado === 'ENABLED' || normalizado === 'ACTIVO') {
      return 'pill-success';
    }
    if (normalizado === 'DISABLED' || normalizado === 'INACTIVO') {
      return 'pill-muted';
    }
    return 'pill-info';
  }
}
