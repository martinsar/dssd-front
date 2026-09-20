import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Oferta } from '../../services/oferta'; 

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
  organizaciones: any[] = [];
  convocatorias: any[] = [];

  constructor(private fb: FormBuilder, private ofertaService: Oferta) {
    this.ofertaForm = this.fb.group({
      cantidad: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required],
      tipo_recurso_id: ['', Validators.required],
      organizacion_id: ['', Validators.required],
      convocatoria_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargamos los tres desplegables al iniciar la pantalla
    this.ofertaService.getTiposRecurso().subscribe(data => this.tiposRecurso = data);
    this.ofertaService.getOrganizaciones().subscribe(data => this.organizaciones = data);
    this.ofertaService.getConvocatorias().subscribe(data => this.convocatorias = data);
  }

  onSubmit() {
    if (this.ofertaForm.valid) {
      this.ofertaService.crearOferta(this.ofertaForm.value).subscribe({
        next: (respuesta: any) => {
          console.log('Respuesta del backend:', respuesta);
          alert(`¡Oferta registrada con éxito! ID: ${respuesta.id}`);
          this.ofertaForm.reset();
        },
        error: (err: any) => {
          console.error('Error al enviar la petición:', err);
          alert('Hubo un error al comunicar con el servidor.');
        }
      });
    } else {
      alert('Por favor, completa todos los campos requeridos correctamente.');
    }
  }
}