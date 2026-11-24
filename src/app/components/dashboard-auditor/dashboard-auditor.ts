import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CantidadPorEtiquetaDto, IndicadoresDto } from '../../models/indicadores.model';
import { AuditorService } from '../../services/auditor.service';
import { AuthService } from '../../services/auth.service';
import {
  ExportacionAuditorService,
  OPCIONES_TABLAS_CSV,
  TablaExportable,
} from '../../services/exportacion-auditor.service';
import { BonitaMetricasComponent } from './bonita-metricas/bonita-metricas';

type VistaTablero = 'todos' | 'operacion' | 'bonita';

@Component({
  selector: 'app-dashboard-auditor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BonitaMetricasComponent],
  templateUrl: './dashboard-auditor.html',
  styleUrl: './dashboard-auditor.scss',
})
export class DashboardAuditorComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auditorService = inject(AuditorService);
  private readonly exportacionService = inject(ExportacionAuditorService);
  readonly authService = inject(AuthService);

  readonly indicadores = signal<IndicadoresDto | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorLogin = signal<string | null>(null);
  readonly iniciandoSesion = signal(false);

  readonly desde = signal<string>('');
  readonly hasta = signal<string>('');
  readonly vistaActiva = signal<VistaTablero>('todos');
  readonly tablaCsvSeleccionada = signal<TablaExportable>('cobertura');
  readonly mensajeExportacion = signal<string | null>(null);
  readonly opcionesTablasCsv = OPCIONES_TABLAS_CSV;

  private avisoExportTimer: ReturnType<typeof setTimeout> | null = null;

  readonly ringCircumference = 2 * Math.PI * 38;

  readonly loginForm = this.fb.nonNullable.group({
    username: ['auditor', Validators.required],
    password: ['', Validators.required],
  });

  readonly mostrarOperacion = computed(() => {
    const v = this.vistaActiva();
    return v === 'todos' || v === 'operacion';
  });

  readonly mostrarBonita = computed(() => {
    const v = this.vistaActiva();
    return v === 'todos' || v === 'bonita';
  });

  readonly bonitasDisponibles = computed(() => {
    const data = this.indicadores();
    if (!data) {
      return 0;
    }
    return [
      data.estadosCasosBonita.disponible,
      data.tiemposPorEtapa.disponible,
      data.cuellosDeBotellaBonita.disponible,
      data.tiemposEsperaVsEjecucionBonita.disponible,
      data.tiemposResolucionCruzados.disponible,
      data.actividadUsuariosBonita.disponible,
    ].filter(Boolean).length;
  });

  ngOnInit(): void {
    if (this.authService.estaAutenticado() && this.authService.esAuditor()) {
      this.cargarIndicadores();
    }
  }

  ngOnDestroy(): void {
    if (this.avisoExportTimer) {
      clearTimeout(this.avisoExportTimer);
    }
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.iniciandoSesion.set(true);
    this.errorLogin.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (sesion) => {
        this.iniciandoSesion.set(false);
        this.loginForm.controls.password.reset('');
        if (sesion.usuario.rol !== 'AUDITOR') {
          this.errorLogin.set(
            `Ingresaste como ${sesion.usuario.username} (${sesion.usuario.rol}), pero el tablero requiere el perfil AUDITOR.`,
          );
          return;
        }
        this.cargarIndicadores();
      },
      error: (err: HttpErrorResponse) => {
        this.iniciandoSesion.set(false);
        this.errorLogin.set(this.extraerMensajeError(err, 'No se pudo iniciar sesión. Verificá usuario y contraseña.'));
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe(() => {
      this.indicadores.set(null);
      this.error.set(null);
      this.errorLogin.set(null);
    });
  }

  cargarIndicadores(): void {
    const fechaDesde = this.desde().trim();
    const fechaHasta = this.hasta().trim();

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      this.error.set('La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auditorService.getIndicadores(fechaDesde || null, fechaHasta || null).subscribe({
      next: (datos) => {
        this.indicadores.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.authService.limpiarSesion();
          this.indicadores.set(null);
          this.errorLogin.set(this.extraerMensajeError(err, 'Tu sesión expiró. Iniciá sesión nuevamente.'));
          return;
        }
        this.error.set(this.extraerMensajeError(err, 'No se pudieron obtener los indicadores del servidor.'));
      },
    });
  }

  limpiarFiltros(): void {
    this.desde.set('');
    this.hasta.set('');
    this.cargarIndicadores();
  }

  cambiarVista(vista: VistaTablero): void {
    this.vistaActiva.set(vista);
  }

  exportarJson(): void {
    const data = this.indicadores();
    if (!data) {
      return;
    }
    const archivo = this.exportacionService.exportarJson(data);
    this.notificarExportacion(`Exportado: ${archivo}`);
  }

  exportarCsvCompleto(): void {
    const data = this.indicadores();
    if (!data) {
      return;
    }
    const archivo = this.exportacionService.exportarCsvCompleto(data);
    this.notificarExportacion(`Exportado: ${archivo}`);
  }

  exportarCsvTablaSeleccionada(): void {
    const data = this.indicadores();
    if (!data) {
      return;
    }
    const archivo = this.exportacionService.exportarCsvTabla(this.tablaCsvSeleccionada(), data);
    this.notificarExportacion(`Exportado: ${archivo}`);
  }

  exportarXml(): void {
    const data = this.indicadores();
    if (!data) {
      return;
    }
    const archivo = this.exportacionService.exportarXml(data);
    this.notificarExportacion(`Exportado: ${archivo}`);
  }

  imprimirReporte(): void {
    window.print();
  }

  private notificarExportacion(mensaje: string): void {
    this.mensajeExportacion.set(mensaje);
    if (this.avisoExportTimer) {
      clearTimeout(this.avisoExportTimer);
    }
    this.avisoExportTimer = setTimeout(() => this.mensajeExportacion.set(null), 4000);
  }

  ringOffset(porcentaje: number | null | undefined): number {
    const pct = Math.max(0, Math.min(100, porcentaje ?? 0));
    return this.ringCircumference * (1 - pct / 100);
  }

  maxCantidad(items: CantidadPorEtiquetaDto[]): number {
    return Math.max(0, ...items.map((i) => i.cantidad));
  }

  totalCantidad(items: CantidadPorEtiquetaDto[]): number {
    return items.reduce((acc, i) => acc + i.cantidad, 0);
  }

  maxUnidadesOng(): number {
    const orgs = this.indicadores()?.rankingOngs.organizaciones ?? [];
    return Math.max(0, ...orgs.map((o) => o.unidadesMovilizadas));
  }

  porcentajeBarra(valor: number, maximo: number): number {
    if (!maximo || maximo <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round((valor / maximo) * 1000) / 10));
  }

  porcentajeSobreTotal(valor: number, total: number): number {
    if (!total || total <= 0) {
      return 0;
    }
    return Math.round((valor / total) * 1000) / 10;
  }

  fuenteSeccion(clave: string, fallback = 'DSSD_DB'): string {
    const mapa = this.indicadores()?.fuentesPorSeccion;
    return mapa?.[clave] ?? fallback;
  }

  claseFuente(fuente: string | null | undefined): string {
    if (!fuente) {
      return 'source-dssd';
    }
    if (fuente.includes('+')) {
      return 'source-combinada';
    }
    return fuente === 'BONITA_API' ? 'source-bonita' : 'source-dssd';
  }

  formatearEtiqueta(etiqueta: string): string {
    if (!etiqueta) {
      return 'Sin dato';
    }
    if (!/^[A-Z0-9_]+$/.test(etiqueta)) {
      return etiqueta;
    }
    const palabras = etiqueta.toLowerCase().split('_');
    return palabras.map((p, idx) => (idx === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p)).join(' ');
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

  claseGravedad(etiqueta: string): string {
    const norm = etiqueta.toLowerCase();
    if (norm.includes('crít') || norm.includes('crit')) {
      return 'bar-red';
    }
    if (norm.includes('alt')) {
      return 'bar-orange';
    }
    if (norm.includes('med')) {
      return 'bar-amber';
    }
    if (norm.includes('baj')) {
      return 'bar-green';
    }
    return 'bar-blue';
  }

  claseEstadoOferta(etiqueta: string): string {
    const norm = etiqueta.toUpperCase();
    if (norm === 'ADJUDICADA' || norm === 'FINALIZADA') {
      return 'bar-green';
    }
    if (norm === 'VALIDADA' || norm === 'SELECCIONADA') {
      return 'bar-blue';
    }
    if (norm === 'PENDIENTE') {
      return 'bar-amber';
    }
    if (norm === 'NO_HABILITADA' || norm === 'NO_SELECCIONADA') {
      return 'bar-red';
    }
    return 'bar-slate';
  }

  claseCobertura(porcentaje: number): string {
    if (porcentaje >= 90) {
      return 'bar-green';
    }
    if (porcentaje >= 50) {
      return 'bar-amber';
    }
    return 'bar-red';
  }

  private extraerMensajeError(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el backend en http://localhost:8082. Verificá que el servicio esté levantado.';
    }
    const body = err.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object') {
      const posible = body.mensaje || body.message || body.error;
      if (typeof posible === 'string' && posible.trim()) {
        return posible;
      }
    }
    return fallback;
  }
}
