import { Routes } from '@angular/router';
import { AltaEmergenciaComponent } from './components/alta-emergencia/alta-emergencia';
import { CargaOfertas } from './components/carga-ofertas/carga-ofertas';
import { PublicacionNecesidades } from './components/publicacion-necesidades/publicacion-necesidades';
export const routes: Routes = [
  { path: 'emergencia', component: AltaEmergenciaComponent },
  { path: 'ofertas', component: CargaOfertas },
  { path: '', redirectTo: '/emergencia', pathMatch: 'full' },
  { path: 'necesidades', component: PublicacionNecesidades },
];