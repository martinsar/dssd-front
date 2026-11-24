// [Entrega final] Estructura común: barra de navegación según el perfil y contenido
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MENU_POR_ROL, NOMBRE_ROL } from '../auth/roles';
import { NotificacionService } from '../../services/notificacion';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html'
})
export class Shell implements OnInit {
  readonly auth = inject(AuthService);
  readonly notificaciones = inject(NotificacionService);
  private router = inject(Router);

  menuAbierto = signal(false);

  menu = computed(() => {
    const rol = this.auth.rol();
    return rol ? MENU_POR_ROL[rol] : [];
  });

  // Se arma "Nombre Apellido · Perfil · Organización"
  descripcionUsuario = computed(() => {
    const u = this.auth.usuario();
    if (!u) {
      return '';
    }
    const partes = [`${u.nombre} ${u.apellido}`.trim(), NOMBRE_ROL[u.rol]];
    if (u.organizacionNombre) {
      partes.push(u.organizacionNombre);
    }
    return partes.join(' · ');
  });

  constructor() {
    // Se cierra el menú y se actualiza el contador de no leídas en cada navegación
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.menuAbierto.set(false);
        this.actualizarNotificaciones();
      });
  }

  ngOnInit(): void {
    this.notificaciones.noLeidas.set(0);
    this.actualizarNotificaciones();
  }

  alternarMenu(): void {
    this.menuAbierto.update(v => !v);
  }

  cerrarSesion(): void {
    this.notificaciones.noLeidas.set(0);
    this.auth.logout();
  }

  // Solo las ONGs tienen notificaciones
  private actualizarNotificaciones(): void {
    if (this.auth.rol() === 'ONG') {
      this.notificaciones.refrescarNoLeidas();
    }
  }
}
