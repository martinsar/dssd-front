// [Entrega final] Pantalla de inicio de sesión
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { PREFIJO_ROL } from '../../core/auth/roles';
import { Rol } from '../../models/sesion.model';
import { mensajeDeError } from '../../shared/api-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  enviando = signal(false);
  error = signal<string | null>(null);
  expirada = this.route.snapshot.queryParamMap.get('motivo') === 'expirada';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  // Se inicia sesión y se navega a la pantalla de inicio del perfil
  ingresar(): void {
    if (this.enviando()) {
      return;
    }
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.enviando.set(true);
    this.auth.login(username.trim(), password).subscribe({
      next: usuario => {
        this.enviando.set(false);
        const volver = this.route.snapshot.queryParamMap.get('volver');
        void this.router.navigateByUrl(this.esDelRol(volver, usuario.rol) ? (volver as string) : this.auth.rutaInicio(usuario.rol));
      },
      error: err => {
        this.enviando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse && err.status === 0
            ? 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.'
            : mensajeDeError(err)
        );
      }
    });
  }

  // Solo se vuelve a una ruta que pertenece al perfil
  private esDelRol(url: string | null, rol: Rol): boolean {
    if (!url) {
      return false;
    }
    const base = `/${PREFIJO_ROL[rol]}`;
    return url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`);
  }

  invalido(campo: 'username' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }
}
