import { Component, OnInit } from '@angular/core'; // <-- Importa OnInit
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmergenciaService } from '../../services/emergencia'; 
import { Emergencia } from '../../models/emergencia.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alta-emergencia',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './alta-emergencia.html', 
  styleUrl: './alta-emergencia.scss'
})
export class AltaEmergenciaComponent implements OnInit { // <-- Agrega implements OnInit
  emergenciaForm: FormGroup;
  tiposEmergencia: any[] = []; // <-- Variable para almacenar los datos del backend

  constructor(private fb: FormBuilder, private emergenciaService: EmergenciaService) {
    this.emergenciaForm = this.fb.group({
      tipoDesastre: ['', Validators.required],
      nivelGravedad: ['', Validators.required],
      zonaAfectada: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  // <-- Nuevo bloque para cargar datos al inicio
  ngOnInit(): void {
    this.emergenciaService.getTiposEmergencia().subscribe({
      next: (datos) => {
        this.tiposEmergencia = datos;
      },
      error: (err) => console.error('Error cargando tipos de emergencia:', err)
    });
  }

  onSubmit() {
    if (this.emergenciaForm.valid) {
      const nuevaEmergencia: Emergencia = this.emergenciaForm.value;
      
      this.emergenciaService.crearEmergencia(nuevaEmergencia).subscribe({
        next: (respuesta: any) => { 
          console.log('Respuesta del backend:', respuesta);
          alert(`¡Emergencia registrada con éxito! ID: ${respuesta.id}`);
          this.emergenciaForm.reset(); 
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