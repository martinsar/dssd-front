import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmergenciaService } from '../../services/emergencia';
import { Emergencia } from '../../models/emergencia.model';

@Component({
  selector: 'app-alta-emergencia',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './alta-emergencia.html',
  styleUrl: './alta-emergencia.scss'
})
export class AltaEmergenciaComponent implements OnInit {
  emergenciaForm: FormGroup;
  tiposEmergencia: any[] = [];

  // [Entrega final] Se muestran los resultados en la pantalla en lugar de alert()
  readonly enviando = signal(false);
  readonly intentoEnviar = signal(false);
  readonly exito = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  constructor(private fb: FormBuilder, private emergenciaService: EmergenciaService) {
    this.emergenciaForm = this.fb.group({
      tipoDesastre: ['', Validators.required],
      nivelGravedad: ['', Validators.required],
      zonaAfectada: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.emergenciaService.getTiposEmergencia().subscribe({
      next: (datos) => { this.tiposEmergencia = datos; },
      error: () => this.error.set('No pudimos cargar los tipos de desastre. Recargá la página.')
    });
  }

  onSubmit() {
    this.intentoEnviar.set(true);
    this.exito.set(null);
    this.error.set(null);
    if (this.emergenciaForm.invalid) {
      this.emergenciaForm.markAllAsTouched();
      return;
    }
    const nuevaEmergencia: Emergencia = this.emergenciaForm.value;
    this.enviando.set(true);
    this.emergenciaService.crearEmergencia(nuevaEmergencia).subscribe({
      next: (respuesta: any) => {
        this.enviando.set(false);
        this.intentoEnviar.set(false);
        this.exito.set(respuesta?.id ?? null);
        this.emergenciaForm.reset({ tipoDesastre: '', nivelGravedad: '', zonaAfectada: '', descripcion: '' });
      },
      error: (err: any) => {
        this.enviando.set(false);
        this.error.set(err?.error?.error ?? err?.error?.message ?? 'No pudimos registrar la emergencia. Intentá de nuevo.');
      }
    });
  }
}
