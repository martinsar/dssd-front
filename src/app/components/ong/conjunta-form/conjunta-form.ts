// [Entrega final] Pantalla de la ONG: crear una oferta conjunta eligiendo las ONGs participantes
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OngService } from '../../../services/ong';
import { ConvocatoriaAbierta } from '../../../models/convocatoria.model';
import { OrganizacionResumen } from '../../../models/oferta.model';
import { mensajeDeError } from '../../../shared/api-error';

@Component({
  selector: 'app-conjunta-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './conjunta-form.html'
})
export class ConjuntaForm implements OnInit {
  private ong = inject(OngService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  convocatorias = signal<ConvocatoriaAbierta[]>([]);
  organizaciones = signal<OrganizacionResumen[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  convocatoriaId = signal<number | null>(Number(this.route.snapshot.queryParamMap.get('convocatoria')) || null);
  elegidas = signal<number[]>([]);
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);
  intentado = signal(false);

  // Solo se puede crear sobre convocatorias con la ventana abierta
  abiertas = computed(() => this.convocatorias().filter(c => c.abierta));

  puedeEnviar = computed(() => this.convocatoriaId() !== null && this.elegidas().length > 0);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({ convocatorias: this.ong.convocatorias(), organizaciones: this.ong.organizaciones() }).subscribe({
      next: ({ convocatorias, organizaciones }) => {
        this.convocatorias.set(convocatorias);
        this.organizaciones.set(organizaciones);
        // Si la convocatoria preseleccionada no está abierta, se descarta
        const id = this.convocatoriaId();
        if (id !== null && !convocatorias.some(c => c.convocatoriaId === id && c.abierta)) {
          this.convocatoriaId.set(null);
        }
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      }
    });
  }

  elegirConvocatoria(valor: string): void {
    this.convocatoriaId.set(Number(valor) || null);
  }

  estaElegida(id: number): boolean {
    return this.elegidas().includes(id);
  }

  alternar(id: number, marcada: boolean): void {
    this.elegidas.update(lista => (marcada ? [...lista.filter(x => x !== id), id] : lista.filter(x => x !== id)));
  }

  // Se crea la oferta conjunta y se pasa a su detalle
  crear(): void {
    if (this.enviando()) {
      return;
    }
    this.intentado.set(true);
    this.errorEnvio.set(null);
    const convocatoriaId = this.convocatoriaId();
    if (convocatoriaId === null || this.elegidas().length === 0) {
      return;
    }
    this.enviando.set(true);
    this.ong.crearOfertaConjunta({ convocatoriaId, participantesIds: this.elegidas() }).subscribe({
      next: creada => {
        this.enviando.set(false);
        void this.router.navigate(['/ong/ofertas-conjuntas', creada.id], { queryParams: { creada: 1 } });
      },
      error: err => {
        this.enviando.set(false);
        this.errorEnvio.set(mensajeDeError(err));
      }
    });
  }
}
