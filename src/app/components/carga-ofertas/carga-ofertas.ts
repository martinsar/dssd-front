import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Oferta } from '../../services/oferta';
// [Entrega final] La organización sale de la sesión y los errores se muestran sin jerga
import { AuthService } from '../../core/auth/auth.service';
import { mensajeDeError } from '../../shared/api-error';

@Component({
  selector: 'app-carga-ofertas',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './carga-ofertas.html',
  styleUrl: './carga-ofertas.scss'
})
export class CargaOfertas implements OnInit {
  ofertaForm: FormGroup;
  tiposRecurso: any[] = [];
  convocatorias: any[] = [];

  // [Entrega final] Organización de la sesión y estado de envío
  enviando = false;
  mensaje: { tipo: 'ok' | 'error'; texto: string } | null = null;

  constructor(private fb: FormBuilder, private ofertaService: Oferta, public auth: AuthService) {
    this.ofertaForm = this.fb.group({
      cantidad: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required],
      tipo_recurso_id: ['', Validators.required],
      convocatoria_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargamos los dos desplegables al iniciar la pantalla
    this.ofertaService.getTiposRecurso().subscribe(data => this.tiposRecurso = data);
    this.ofertaService.getConvocatorias().subscribe(data => this.convocatorias = data);
  }

  onSubmit() {
    const organizacionId = this.auth.usuario()?.organizacionId;
    if (this.ofertaForm.invalid || this.enviando) {
      this.ofertaForm.markAllAsTouched();
      this.mensaje = { tipo: 'error', texto: 'Completá todos los campos para registrar la oferta.' };
      return;
    }
    if (!organizacionId) {
      this.mensaje = { tipo: 'error', texto: 'Tu usuario no tiene una organización asignada. Consultá con el Centro Coordinador.' };
      return;
    }
    this.enviando = true;
    this.mensaje = null;
    // La organización se toma de la sesión (el servidor también la valida)
    this.ofertaService.crearOferta({ ...this.ofertaForm.value, organizacion_id: organizacionId }).subscribe({
      next: () => {
        this.enviando = false;
        this.mensaje = { tipo: 'ok', texto: '¡Listo! Tu oferta quedó registrada.' };
        this.ofertaForm.reset({ cantidad: '', descripcion: '', tipo_recurso_id: '', convocatoria_id: '' });
      },
      error: (err: unknown) => {
        this.enviando = false;
        this.mensaje = { tipo: 'error', texto: mensajeDeError(err) };
      }
    });
  }
}
