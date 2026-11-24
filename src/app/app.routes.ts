import { Routes } from '@angular/router';
import { AltaEmergenciaComponent } from './components/alta-emergencia/alta-emergencia';
import { CargaOfertas } from './components/carga-ofertas/carga-ofertas';
import { PublicacionNecesidades } from './components/publicacion-necesidades/publicacion-necesidades';
import { DashboardAuditorComponent } from './components/dashboard-auditor/dashboard-auditor';

export const routes: Routes = [
  { path: 'emergencia', component: AltaEmergenciaComponent },
  { path: 'ofertas', component: CargaOfertas },
  { path: 'necesidades', component: PublicacionNecesidades },
  { path: 'auditor', component: DashboardAuditorComponent },
  { path: '', redirectTo: '/emergencia', pathMatch: 'full' },
];