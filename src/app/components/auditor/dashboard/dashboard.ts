// [Entrega final] Pantalla del Auditor: indicadores y control de emergencias
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuditorService } from '../../../services/auditor';
import { AuditoriaEmergencia, CantidadPorEtiqueta, Indicadores } from '../../../models/indicadores.model';
import { mensajeDeError } from '../../../shared/api-error';
import { claseGravedad } from '../../../shared/gravedad';
import { exportarCsv } from '../../../shared/csv';
import { GraficoBarras, DatoBarra } from '../../../shared/grafico-barras/grafico-barras';
import {
  CLASE_ETAPA,
  ETIQUETA_ETAPA,
  ORDEN_ETAPAS,
  etiquetaEstadoOferta,
  etiquetaEtapa
} from '../../../shared/etiquetas';

interface FilaIndicador {
  seccion: string;
  etiqueta: string;
  valor: number | string;
}

@Component({
  selector: 'app-dashboard-auditor',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, GraficoBarras],
  templateUrl: './dashboard.html'
})
export class DashboardAuditor implements OnInit {
  private auditor = inject(AuditorService);

  readonly claseGravedad = claseGravedad;
  readonly claseEtapa = CLASE_ETAPA;
  readonly etiquetaEtapa = ETIQUETA_ETAPA;

  desde = new FormControl('', { nonNullable: true });
  hasta = new FormControl('', { nonNullable: true });

  indicadores = signal<Indicadores | null>(null);
  emergencias = signal<AuditoriaEmergencia[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  etapaFiltro = signal<string | null>(null);

  sinDatos = computed(() => {
    const i = this.indicadores();
    return !i || (i.totales.emergencias === 0 && this.emergencias().length === 0);
  });

  suministros = computed<DatoBarra[]>(() =>
    (this.indicadores()?.suministrosPorTipo ?? []).map(d => ({ etiqueta: d.etiqueta, valor: d.cantidad }))
  );

  porEtapa = computed<DatoBarra[]>(() => {
    const lista = [...(this.indicadores()?.emergenciasPorEtapa ?? [])];
    const posicion = (clave: string) => {
      const p = ORDEN_ETAPAS.findIndex(e => e === clave);
      return p < 0 ? ORDEN_ETAPAS.length : p;
    };
    lista.sort((a, b) => posicion(a.etiqueta) - posicion(b.etiqueta));
    return lista.map(d => ({ etiqueta: etiquetaEtapa(d.etiqueta), valor: d.cantidad, clave: d.etiqueta }));
  });

  porEstadoOferta = computed<DatoBarra[]>(() =>
    (this.indicadores()?.ofertasPorEstado ?? []).map(d => ({ etiqueta: etiquetaEstadoOferta(d.etiqueta), valor: d.cantidad }))
  );

  porGravedad = computed<DatoBarra[]>(() =>
    (this.indicadores()?.emergenciasPorGravedad ?? []).map(d => ({ etiqueta: d.etiqueta, valor: d.cantidad }))
  );

  tiempos = computed<DatoBarra[]>(() =>
    (this.indicadores()?.tiemposPorEtapa.etapas ?? []).map(t => ({
      etiqueta: `${t.etapa} (${t.casos} casos)`,
      valor: Math.round(t.promedioHoras * 10) / 10
    }))
  );

  emergenciasVisibles = computed(() => {
    const etapa = this.etapaFiltro();
    return etapa ? this.emergencias().filter(e => e.etapa === etapa) : this.emergencias();
  });

  ngOnInit(): void {
    this.cargar();
  }

  // Se cargan los indicadores y las emergencias del período elegido
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.etapaFiltro.set(null);
    const desde = this.desde.value || undefined;
    const hasta = this.hasta.value || undefined;
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha "desde" no puede ser posterior a la fecha "hasta".');
      this.cargando.set(false);
      return;
    }
    forkJoin({
      indicadores: this.auditor.indicadores(desde, hasta),
      emergencias: this.auditor.emergencias(desde, hasta)
    }).subscribe({
      next: ({ indicadores, emergencias }) => {
        this.indicadores.set(indicadores);
        this.emergencias.set(emergencias);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  // Click en una barra de etapa: se filtra la tabla (o se quita el filtro si ya estaba)
  filtrarPorEtapa(clave: string): void {
    this.etapaFiltro.set(this.etapaFiltro() === clave ? null : clave);
  }

  nombreEtapa(clave: string): string {
    return etiquetaEtapa(clave);
  }

  quitarFiltro(): void {
    this.etapaFiltro.set(null);
  }

  exportarIndicadores(): void {
    const i = this.indicadores();
    if (!i) {
      return;
    }
    const filas: FilaIndicador[] = [
      { seccion: 'Totales', etiqueta: 'Emergencias', valor: i.totales.emergencias },
      { seccion: 'Totales', etiqueta: 'Convocatorias publicadas', valor: i.totales.convocatoriasPublicadas },
      { seccion: 'Totales', etiqueta: 'Ofertas recibidas', valor: i.totales.ofertasRecibidas },
      { seccion: 'Totales', etiqueta: 'Ofertas adjudicadas', valor: i.totales.ofertasAdjudicadas },
      { seccion: 'Totales', etiqueta: 'Proyectos en curso', valor: i.totales.proyectosEnCurso },
      { seccion: 'Totales', etiqueta: 'Proyectos finalizados', valor: i.totales.proyectosFinalizados },
      { seccion: 'Totales', etiqueta: 'Suministros movilizados', valor: i.totales.suministrosMovilizados },
      ...this.filasDe('Suministros por tipo', i.suministrosPorTipo, x => x),
      ...this.filasDe('Emergencias por etapa', i.emergenciasPorEtapa, etiquetaEtapa),
      ...this.filasDe('Emergencias por gravedad', i.emergenciasPorGravedad, x => x),
      ...this.filasDe('Ofertas por estado', i.ofertasPorEstado, etiquetaEstadoOferta),
      { seccion: 'Ofertas conjuntas', etiqueta: 'Ofertas adjudicadas', valor: i.ofertasConjuntas.ofertasAdjudicadas },
      { seccion: 'Ofertas conjuntas', etiqueta: 'Adjudicadas en oferta conjunta', valor: i.ofertasConjuntas.adjudicadasEnConjunta },
      { seccion: 'Ofertas conjuntas', etiqueta: '% de ofertas en ofertas conjuntas', valor: i.ofertasConjuntas.porcentajeOfertas },
      { seccion: 'Ofertas conjuntas', etiqueta: 'Unidades adjudicadas', valor: i.ofertasConjuntas.unidadesAdjudicadas },
      { seccion: 'Ofertas conjuntas', etiqueta: 'Unidades en ofertas conjuntas', valor: i.ofertasConjuntas.unidadesEnConjunta },
      { seccion: 'Ofertas conjuntas', etiqueta: '% de unidades en ofertas conjuntas', valor: i.ofertasConjuntas.porcentajeUnidades }
    ];
    exportarCsv<FilaIndicador>(
      'indicadores.csv',
      [
        { titulo: 'Sección', valor: f => f.seccion },
        { titulo: 'Indicador', valor: f => f.etiqueta },
        { titulo: 'Valor', valor: f => f.valor }
      ],
      filas
    );
  }

  exportarEmergencias(): void {
    exportarCsv<AuditoriaEmergencia>(
      'emergencias.csv',
      [
        { titulo: 'N° de emergencia', valor: e => e.id },
        { titulo: 'Tipo de desastre', valor: e => e.tipoDesastre },
        { titulo: 'Gravedad', valor: e => e.nivelGravedad },
        { titulo: 'Zona', valor: e => e.zonaAfectada },
        { titulo: 'Fecha de registro', valor: e => e.fechaCreacion },
        { titulo: 'Etapa', valor: e => etiquetaEtapa(e.etapa) },
        { titulo: 'Cierre de la convocatoria', valor: e => e.fechaCierreConvocatoria },
        { titulo: 'Ofertas', valor: e => e.ofertas },
        { titulo: 'Ofertas adjudicadas', valor: e => e.ofertasAdjudicadas },
        { titulo: 'Unidades movilizadas', valor: e => e.unidadesMovilizadas },
        { titulo: 'Ofertas en oferta conjunta', valor: e => e.ofertasEnConjunta },
        { titulo: 'Proyecto', valor: e => e.proyectoEstado }
      ],
      this.emergenciasVisibles()
    );
  }

  private filasDe(seccion: string, datos: CantidadPorEtiqueta[], traducir: (x: string) => string): FilaIndicador[] {
    return datos.map(d => ({ seccion, etiqueta: traducir(d.etiqueta), valor: d.cantidad }));
  }
}
