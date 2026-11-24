import { Injectable } from '@angular/core';
import { IndicadoresDto } from '../models/indicadores.model';

export type TablaExportable =
  | 'cobertura'
  | 'ranking-ongs'
  | 'distribuciones'
  | 'bonita-tiempos'
  | 'bonita-cuellos'
  | 'bonita-usuarios';

export interface OpcionTablaCsv {
  id: TablaExportable;
  etiqueta: string;
}

export const OPCIONES_TABLAS_CSV: readonly OpcionTablaCsv[] = [
  { id: 'cobertura', etiqueta: 'Cobertura por tipo de recurso' },
  { id: 'ranking-ongs', etiqueta: 'Ranking de ONGs' },
  { id: 'distribuciones', etiqueta: 'Distribuciones (suministros, etapas, gravedad, ofertas)' },
  { id: 'bonita-tiempos', etiqueta: 'Bonita: Tiempos por etapa y cruzados' },
  { id: 'bonita-cuellos', etiqueta: 'Bonita: Cuellos de botella y espera vs. ejecución' },
  { id: 'bonita-usuarios', etiqueta: 'Bonita: Actividad por usuario' },
];

const UTF8_BOM = '\uFEFF';

@Injectable({
  providedIn: 'root',
})
export class ExportacionAuditorService {
  exportarJson(data: IndicadoresDto): string {
    const nombre = this.construirNombreArchivo('indicadores-auditoria', 'json', data);
    const contenido = this.generarJson(data);
    this.descargarArchivo(contenido, nombre, 'application/json;charset=utf-8');
    return nombre;
  }

  exportarCsvCompleto(data: IndicadoresDto): string {
    const nombre = this.construirNombreArchivo('indicadores-auditoria', 'csv', data);
    const contenido = this.generarCsvCompleto(data);
    this.descargarArchivo(UTF8_BOM + contenido, nombre, 'text/csv;charset=utf-8');
    return nombre;
  }

  exportarCsvTabla(tabla: TablaExportable, data: IndicadoresDto): string {
    const nombre = this.construirNombreArchivo(`indicadores-${tabla}`, 'csv', data);
    const contenido = this.generarCsvTabla(tabla, data);
    this.descargarArchivo(UTF8_BOM + contenido, nombre, 'text/csv;charset=utf-8');
    return nombre;
  }

  exportarXml(data: IndicadoresDto): string {
    const nombre = this.construirNombreArchivo('indicadores-auditoria', 'xml', data);
    const contenido = this.generarXml(data);
    this.descargarArchivo(contenido, nombre, 'application/xml;charset=utf-8');
    return nombre;
  }

  construirNombreArchivo(prefijo: string, extension: string, data: IndicadoresDto): string {
    const periodo =
      data.desde || data.hasta
        ? `${data.desde || 'inicio'}_a_${data.hasta || 'hoy'}`
        : 'historico';
    return `${prefijo}_${periodo}.${extension}`;
  }

  generarJson(data: IndicadoresDto): string {
    return JSON.stringify(data, null, 2);
  }

  generarCsvCompleto(data: IndicadoresDto): string {
    const filas: (string | number | boolean | null | undefined)[][] = [
      ['Seccion', 'Fuente', 'Item', 'Metrica', 'Valor', 'Detalle'],
    ];

    const add = (
      seccion: string,
      fuente: string,
      item: string,
      metrica: string,
      valor: string | number | boolean | null | undefined,
      detalle = '',
    ) => {
      filas.push([seccion, fuente, item, metrica, valor ?? '', detalle]);
    };

    // Metadatos
    add('Metadatos', data.fuente, 'Reporte', 'Generado en', data.generadoEn);
    add('Metadatos', data.fuente, 'Periodo', 'Desde', data.desde ?? 'Inicio');
    add('Metadatos', data.fuente, 'Periodo', 'Hasta', data.hasta ?? 'Hoy');

    // Totales
    const t = data.totales;
    add('Totales', t.fuente, 'General', 'Emergencias', t.emergencias);
    add('Totales', t.fuente, 'General', 'Convocatorias publicadas', t.convocatoriasPublicadas);
    add('Totales', t.fuente, 'General', 'Ofertas recibidas', t.ofertasRecibidas);
    add('Totales', t.fuente, 'General', 'Ofertas adjudicadas', t.ofertasAdjudicadas);
    add('Totales', t.fuente, 'General', 'Proyectos en curso', t.proyectosEnCurso);
    add('Totales', t.fuente, 'General', 'Proyectos finalizados', t.proyectosFinalizados);
    add('Totales', t.fuente, 'General', 'Suministros movilizados', t.suministrosMovilizados);

    // Proyectos
    const p = data.proyectos;
    add('Proyectos', p.fuente, 'Estado', 'En curso', p.enCurso);
    add('Proyectos', p.fuente, 'Estado', 'Finalizados', p.finalizados);
    add('Proyectos', p.fuente, 'Estado', 'Sin proyecto', p.sinProyecto);
    add('Proyectos', p.fuente, 'Indicador', 'Porcentaje finalizados (%)', p.porcentajeFinalizados);
    add('Proyectos', p.fuente, 'Indicador', 'Duracion promedio finalizados (horas)', p.duracionPromedioFinalizadosHoras ?? '');

    // Ofertas Conjuntas
    const oc = data.ofertasConjuntas;
    add('Ofertas Conjuntas', oc.fuente, 'Ofertas', 'Adjudicadas en consorcio', oc.adjudicadasEnConjunta, `de ${oc.ofertasAdjudicadas} (${oc.porcentajeOfertas}%)`);
    add('Ofertas Conjuntas', oc.fuente, 'Unidades', 'Unidades en consorcio', oc.unidadesEnConjunta, `de ${oc.unidadesAdjudicadas} (${oc.porcentajeUnidades}%)`);
    add('Ofertas Conjuntas', oc.fuente, 'Emergencias', 'Emergencias con consorcio', oc.emergenciasConConsorcio, `de ${oc.emergenciasConAdjudicacion} (${oc.porcentajeEmergenciasConConsorcio}%)`);

    // Distribuciones
    for (const item of data.suministrosPorTipo) {
      add('Suministros por Tipo', data.fuentesPorSeccion?.['suministrosPorTipo'] ?? 'DSSD_DB', item.etiqueta, 'Unidades movilizadas', item.cantidad);
    }
    for (const item of data.emergenciasPorEtapa) {
      add('Emergencias por Etapa', data.fuentesPorSeccion?.['emergenciasPorEtapa'] ?? 'DSSD_DB', item.etiqueta, 'Emergencias', item.cantidad);
    }
    for (const item of data.emergenciasPorGravedad) {
      add('Emergencias por Gravedad', data.fuentesPorSeccion?.['emergenciasPorGravedad'] ?? 'DSSD_DB', item.etiqueta, 'Emergencias', item.cantidad);
    }
    for (const item of data.ofertasPorEstado) {
      add('Ofertas por Estado', data.fuentesPorSeccion?.['ofertasPorEstado'] ?? 'DSSD_DB', item.etiqueta, 'Ofertas', item.cantidad);
    }

    // Cobertura de necesidades
    const cob = data.coberturaNecesidades;
    add('Cobertura Necesidades', cob.fuente, 'Global', 'Unidades requeridas', cob.unidadesRequeridas);
    add('Cobertura Necesidades', cob.fuente, 'Global', 'Unidades ofertadas', cob.unidadesOfertadas, `${cob.porcentajeCoberturaOfertada}%`);
    add('Cobertura Necesidades', cob.fuente, 'Global', 'Unidades validadas', cob.unidadesValidadas);
    add('Cobertura Necesidades', cob.fuente, 'Global', 'Unidades adjudicadas', cob.unidadesAdjudicadas, `${cob.porcentajeCoberturaAdjudicada}%`);
    add('Cobertura Necesidades', cob.fuente, 'Convocatorias', 'Con reapertura', cob.convocatoriasConReapertura);
    add('Cobertura Necesidades', cob.fuente, 'Convocatorias', 'Con cobertura parcial', cob.convocatoriasConCoberturaParcial);
    for (const rec of cob.porTipoRecurso) {
      add(
        'Cobertura por Recurso',
        rec.fuente,
        rec.recurso,
        'Cobertura adjudicada (%)',
        rec.porcentajeCoberturaAdjudicada,
        `req=${rec.unidadesRequeridas}; ofe=${rec.unidadesOfertadas}; adj=${rec.unidadesAdjudicadas}`,
      );
    }

    // Ranking ONGs
    for (const ong of data.rankingOngs.organizaciones) {
      add(
        'Ranking ONGs',
        ong.fuente,
        ong.organizacionNombre,
        'Unidades movilizadas',
        ong.unidadesMovilizadas,
        `presentadas=${ong.ofertasPresentadas}; adjudicadas=${ong.ofertasAdjudicadas}; consorcio=${ong.participacionesEnConsorcio}`,
      );
    }

    // Bonita: Estados de casos
    const ec = data.estadosCasosBonita;
    if (ec.disponible) {
      add('Bonita - Estados Casos', ec.fuente, 'Resumen', 'Versiones desplegadas', ec.versionesProcesoDesplegadas);
      add('Bonita - Estados Casos', ec.fuente, 'Resumen', 'Casos activos', ec.casosActivos);
      add('Bonita - Estados Casos', ec.fuente, 'Resumen', 'Casos finalizados', ec.casosFinalizados);
      add('Bonita - Estados Casos', ec.fuente, 'Resumen', 'Tareas fallidas', ec.tareasFallidas);
      add('Bonita - Estados Casos', ec.fuente, 'Resumen', 'Tasa finalizacion (%)', ec.tasaFinalizacionPorcentaje);
      for (const proc of ec.procesos) {
        add('Bonita - Procesos', proc.fuente, `${proc.nombre} v${proc.version}`, 'Estado activacion', proc.estadoActivacion, `id=${proc.id}`);
      }
    } else {
      add('Bonita - Estados Casos', ec.fuente, 'Estado', 'Disponible', false, ec.mensaje ?? '');
    }

    // Bonita: Tiempos por etapa
    const te = data.tiemposPorEtapa;
    if (te.disponible) {
      add('Bonita - Tiempos Etapa', te.fuente, 'Resumen', 'Casos analizados', te.casosAnalizados);
      add('Bonita - Tiempos Etapa', te.fuente, 'Resumen', 'Casos finalizados', te.casosFinalizadosEnBonita);
      add('Bonita - Tiempos Etapa', te.fuente, 'Resumen', 'Resolucion total promedio (horas)', te.promedioResolucionTotalHoras ?? '');
      for (const et of te.etapas) {
        add('Bonita - Tiempos Etapa', et.fuente, et.etapa, 'Promedio (horas)', et.promedioHoras, `casos=${et.casos}; min=${et.minHoras}; max=${et.maxHoras}`);
      }
    } else {
      add('Bonita - Tiempos Etapa', te.fuente, 'Estado', 'Disponible', false, te.mensaje ?? '');
    }

    // Bonita: Cuellos de botella
    const cb = data.cuellosDeBotellaBonita;
    if (cb.disponible) {
      add('Bonita - Cuellos de Botella', cb.fuente, 'Resumen', 'Casos activos', cb.casosActivosEnBonita);
      add('Bonita - Cuellos de Botella', cb.fuente, 'Resumen', 'Total tareas pendientes', cb.totalTareasPendientes);
      for (const pen of cb.pendientesPorEtapa) {
        add('Bonita - Cuellos de Botella', pen.fuente, pen.etapa, 'Tareas pendientes', pen.cantidadPendientes, `esperaProm=${pen.esperaPromedioHoras}h; esperaMax=${pen.esperaMaximaHoras}h`);
      }
    } else {
      add('Bonita - Cuellos de Botella', cb.fuente, 'Estado', 'Disponible', false, cb.mensaje ?? '');
    }

    // Bonita: Espera vs Ejecución
    const ee = data.tiemposEsperaVsEjecucionBonita;
    if (ee.disponible) {
      add('Bonita - Espera vs Ejecucion', ee.fuente, 'Global', 'Espera promedio (horas)', ee.esperaPromedioGlobalHoras ?? '');
      add('Bonita - Espera vs Ejecucion', ee.fuente, 'Global', 'Ejecucion promedio (horas)', ee.ejecucionPromedioGlobalHoras ?? '');
      add('Bonita - Espera vs Ejecucion', ee.fuente, 'Global', 'Porcentaje espera (%)', ee.porcentajeEsperaGlobal ?? '');
      for (const et of ee.etapas) {
        add('Bonita - Espera vs Ejecucion', et.fuente, et.etapa, 'Porcentaje espera (%)', et.porcentajeEspera, `casos=${et.casos}; espera=${et.esperaPromedioHoras}h; ejec=${et.ejecucionPromedioHoras}h`);
      }
    } else {
      add('Bonita - Espera vs Ejecucion', ee.fuente, 'Estado', 'Disponible', false, ee.mensaje ?? '');
    }

    // Bonita: Tiempos cruzados
    const tc = data.tiemposResolucionCruzados;
    if (tc.disponible) {
      for (const g of tc.porGravedad) {
        add('Bonita - Tiempos por Gravedad', g.fuente, g.etiqueta, 'Promedio resolucion (horas)', g.promedioHoras, `casos=${g.casos}; min=${g.minHoras}; max=${g.maxHoras}`);
      }
      for (const d of tc.porTipoDesastre) {
        add('Bonita - Tiempos por Desastre', d.fuente, d.etiqueta, 'Promedio resolucion (horas)', d.promedioHoras, `casos=${d.casos}; min=${d.minHoras}; max=${d.maxHoras}`);
      }
    } else {
      add('Bonita - Tiempos Cruzados', tc.fuente, 'Estado', 'Disponible', false, tc.mensaje ?? '');
    }

    // Bonita: Actividad de usuarios
    const au = data.actividadUsuariosBonita;
    if (au.disponible) {
      add('Bonita - Actividad Usuarios', au.fuente, 'Resumen', 'Total tareas completadas', au.totalTareasCompletadas);
      for (const u of au.usuarios) {
        add('Bonita - Actividad Usuarios', u.fuente, u.usuario, 'Tareas completadas', u.tareasCompletadas, `promedio=${u.promedioHoras}h`);
      }
    } else {
      add('Bonita - Actividad Usuarios', au.fuente, 'Estado', 'Disponible', false, au.mensaje ?? '');
    }

    return this.serializarCsv(filas);
  }

  generarCsvTabla(tabla: TablaExportable, data: IndicadoresDto): string {
    switch (tabla) {
      case 'cobertura': {
        const filas: (string | number)[][] = [
          ['Recurso', 'Unidades Requeridas', 'Unidades Ofertadas', 'Unidades Adjudicadas', 'Cobertura Adjudicada (%)', 'Fuente'],
          ...data.coberturaNecesidades.porTipoRecurso.map((r) => [
            r.recurso,
            r.unidadesRequeridas,
            r.unidadesOfertadas,
            r.unidadesAdjudicadas,
            r.porcentajeCoberturaAdjudicada,
            r.fuente,
          ]),
        ];
        return this.serializarCsv(filas);
      }

      case 'ranking-ongs': {
        const filas: (string | number)[][] = [
          ['Posicion', 'Organizacion ID', 'Organizacion', 'Ofertas Presentadas', 'Ofertas Adjudicadas', 'Unidades Movilizadas', 'Participaciones en Consorcio', 'Fuente'],
          ...data.rankingOngs.organizaciones.map((o, idx) => [
            idx + 1,
            o.organizacionId ?? '',
            o.organizacionNombre,
            o.ofertasPresentadas,
            o.ofertasAdjudicadas,
            o.unidadesMovilizadas,
            o.participacionesEnConsorcio,
            o.fuente,
          ]),
        ];
        return this.serializarCsv(filas);
      }

      case 'distribuciones': {
        const filas: (string | number)[][] = [
          ['Categoria', 'Etiqueta', 'Cantidad'],
          ...data.suministrosPorTipo.map((i) => ['Suministros por tipo', i.etiqueta, i.cantidad]),
          ...data.emergenciasPorEtapa.map((i) => ['Emergencias por etapa', i.etiqueta, i.cantidad]),
          ...data.emergenciasPorGravedad.map((i) => ['Emergencias por gravedad', i.etiqueta, i.cantidad]),
          ...data.ofertasPorEstado.map((i) => ['Ofertas por estado', i.etiqueta, i.cantidad]),
        ];
        return this.serializarCsv(filas);
      }

      case 'bonita-tiempos': {
        const filas: (string | number)[][] = [
          ['Grupo', 'Etiqueta / Etapa', 'Casos', 'Minimo (horas)', 'Promedio (horas)', 'Maximo (horas)', 'Fuente'],
          ...data.tiemposPorEtapa.etapas.map((e) => [
            'Por etapa',
            e.etapa,
            e.casos,
            e.minHoras,
            e.promedioHoras,
            e.maxHoras,
            e.fuente,
          ]),
          ...data.tiemposResolucionCruzados.porGravedad.map((g) => [
            'Por gravedad',
            g.etiqueta,
            g.casos,
            g.minHoras,
            g.promedioHoras,
            g.maxHoras,
            g.fuente,
          ]),
          ...data.tiemposResolucionCruzados.porTipoDesastre.map((d) => [
            'Por tipo de desastre',
            d.etiqueta,
            d.casos,
            d.minHoras,
            d.promedioHoras,
            d.maxHoras,
            d.fuente,
          ]),
        ];
        return this.serializarCsv(filas);
      }

      case 'bonita-cuellos': {
        const filas: (string | number)[][] = [
          ['Tipo', 'Etapa', 'Cantidad / Casos', 'Espera Promedio (horas)', 'Espera Max / Ejecucion Prom (horas)', 'Porcentaje Espera (%)', 'Fuente'],
          ...data.cuellosDeBotellaBonita.pendientesPorEtapa.map((p) => [
            'Pendientes actuales',
            p.etapa,
            p.cantidadPendientes,
            p.esperaPromedioHoras,
            p.esperaMaximaHoras,
            '',
            p.fuente,
          ]),
          ...data.tiemposEsperaVsEjecucionBonita.etapas.map((e) => [
            'Espera vs Ejecucion',
            e.etapa,
            e.casos,
            e.esperaPromedioHoras,
            e.ejecucionPromedioHoras,
            e.porcentajeEspera,
            e.fuente,
          ]),
        ];
        return this.serializarCsv(filas);
      }

      case 'bonita-usuarios': {
        const filas: (string | number)[][] = [
          ['Usuario', 'Tareas Completadas', 'Tiempo Promedio (horas)', 'Fuente'],
          ...data.actividadUsuariosBonita.usuarios.map((u) => [
            u.usuario,
            u.tareasCompletadas,
            u.promedioHoras,
            u.fuente,
          ]),
        ];
        return this.serializarCsv(filas);
      }
    }
  }

  generarXml(data: IndicadoresDto): string {
    const cuerpo = this.objetoAXml('indicadoresAuditoria', data, 0);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${cuerpo}`;
  }

  private serializarCsv(filas: (string | number | boolean | null | undefined)[][]): string {
    return filas.map((fila) => fila.map((celda) => this.escaparCsv(celda)).join(',')).join('\r\n');
  }

  private escaparCsv(valor: string | number | boolean | null | undefined): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    const texto = String(valor);
    if (/[",\r\n]/.test(texto)) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
  }

  private objetoAXml(etiqueta: string, valor: unknown, nivel: number): string {
    const tag = this.sanitizarTagXml(etiqueta);
    const indent = '  '.repeat(nivel);

    if (valor === null || valor === undefined) {
      return `${indent}<${tag}/>`;
    }

    if (Array.isArray(valor)) {
      if (valor.length === 0) {
        return `${indent}<${tag}/>`;
      }
      const hijos = valor.map((item) => this.objetoAXml('item', item, nivel + 1)).join('\n');
      return `${indent}<${tag}>\n${hijos}\n${indent}</${tag}>`;
    }

    if (typeof valor === 'object') {
      const entradas = Object.entries(valor as Record<string, unknown>);
      if (entradas.length === 0) {
        return `${indent}<${tag}/>`;
      }
      const hijos = entradas.map(([k, v]) => this.objetoAXml(k, v, nivel + 1)).join('\n');
      return `${indent}<${tag}>\n${hijos}\n${indent}</${tag}>`;
    }

    return `${indent}<${tag}>${this.escaparXml(String(valor))}</${tag}>`;
  }

  private sanitizarTagXml(nombre: string): string {
    const limpio = nombre.replace(/[^A-Za-z0-9_.-]/g, '_');
    return /^[A-Za-z_]/.test(limpio) ? limpio : `n_${limpio}`;
  }

  private escaparXml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private descargarArchivo(contenido: string, nombreArchivo: string, mimeType: string): void {
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }
}
