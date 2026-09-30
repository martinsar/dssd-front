import { Routes } from '@angular/router';
import { AltaEmergenciaComponent } from './components/alta-emergencia/alta-emergencia';
import { CargaOfertas } from './components/carga-ofertas/carga-ofertas';
import { PublicacionNecesidades } from './components/publicacion-necesidades/publicacion-necesidades';
// [Entrega 2 · Tarea 4] Pantalla del coordinador (relevamiento + publicación de convocatorias)
import { GestionConvocatoria } from './components/gestion-convocatoria/gestion-convocatoria';
export const routes: Routes = [
  { path: 'emergencia', component: AltaEmergenciaComponent },
  { path: 'ofertas', component: CargaOfertas },
  { path: '', redirectTo: '/emergencia', pathMatch: 'full' },
  // [Entrega 2 · Tarea 4] Ruta vieja: queda accesible pero ya no está en el menú (la reemplaza /coordinador)
  { path: 'necesidades', component: PublicacionNecesidades },
  // [Entrega 2 · Tarea 4] Ruta nueva
  { path: 'coordinador', component: GestionConvocatoria },
];
