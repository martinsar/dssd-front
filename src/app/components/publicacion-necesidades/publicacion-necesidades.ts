import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Necesidad } from '../../services/necesidad';

@Component({
  selector: 'app-publicacion-necesidades',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './publicacion-necesidades.html',
  styleUrl: './publicacion-necesidades.scss'
})
export class PublicacionNecesidades implements OnInit {
  necesidadForm: FormGroup;
  convocatorias: any[] = [];
  tiposRecurso: any[] = [];

  constructor(private fb: FormBuilder, private necesidadService: Necesidad) {
    this.necesidadForm = this.fb.group({
      convocatoria_id: ['', Validators.required],
      tipo_recurso_id: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.necesidadService.getConvocatorias().subscribe(data => this.convocatorias = data);
    this.necesidadService.getTiposRecurso().subscribe(data => this.tiposRecurso = data);
  }

  onSubmit() {
    if (this.necesidadForm.valid) {
      this.necesidadService.crearNecesidad(this.necesidadForm.value).subscribe({
        next: (respuesta: any) => {
          alert(`¡Necesidad publicada con éxito! ID: ${respuesta.id}`);
          this.necesidadForm.reset();
        },
        error: (err: any) => {
          console.error('Error al enviar la petición:', err);
          alert('Hubo un error al comunicar con el servidor.');
        }
      });
    } else {
      alert('Por favor, completa todos los campos requeridos.');
    }
  }
}