import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { autenticadoGuard, invitadoGuard, rolGuard } from './core/auth/auth.guards';
import { Shell } from './core/layout/shell';

// [Entrega final] Rutas por perfil con carga diferida; cada una exige sesión y rol
const aInicio = () => inject(AuthService).rutaInicio();

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: '',
    component: Shell,
    canActivate: [autenticadoGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: aInicio },
      {
        path: 'municipio',
        canActivate: [rolGuard('OPERADOR_MUNICIPAL')],
        children: [
          {
            path: '',
            loadComponent: () => import('./components/municipio/mis-emergencias/mis-emergencias').then(m => m.MisEmergencias)
          },
          {
            path: 'nueva',
            loadComponent: () => import('./components/alta-emergencia/alta-emergencia').then(m => m.AltaEmergenciaComponent)
          },
          {
            path: 'emergencias/:id',
            loadComponent: () => import('./components/municipio/detalle-emergencia/detalle-emergencia').then(m => m.DetalleEmergencia)
          }
        ]
      },
      {
        path: 'coordinador',
        canActivate: [rolGuard('COORDINADOR')],
        children: [
          {
            path: '',
            loadComponent: () => import('./components/coordinador/monitoreo/monitoreo').then(m => m.Monitoreo)
          },
          {
            path: 'convocatorias',
            loadComponent: () => import('./components/gestion-convocatoria/gestion-convocatoria').then(m => m.GestionConvocatoria)
          },
          {
            path: 'emergencias/:id',
            loadComponent: () => import('./components/coordinador/seguimiento-emergencia/seguimiento-emergencia').then(m => m.SeguimientoEmergencia)
          }
        ]
      },
      {
        path: 'ong',
        canActivate: [rolGuard('ONG')],
        children: [
          {
            path: '',
            loadComponent: () => import('./components/ong/convocatorias-abiertas/convocatorias-abiertas').then(m => m.ConvocatoriasAbiertas)
          },
          {
            path: 'convocatorias/:convocatoriaId/ofertar',
            loadComponent: () => import('./components/ong/oferta-form/oferta-form').then(m => m.OfertaForm)
          },
          {
            path: 'ofertas',
            loadComponent: () => import('./components/ong/mis-ofertas/mis-ofertas').then(m => m.MisOfertas)
          },
          {
            path: 'ofertas/:id',
            loadComponent: () => import('./components/ong/detalle-oferta/detalle-oferta').then(m => m.DetalleOferta)
          },
          {
            path: 'ofertas/:id/editar',
            loadComponent: () => import('./components/ong/oferta-form/oferta-form').then(m => m.OfertaForm)
          },
          {
            path: 'ofertas-conjuntas',
            loadComponent: () => import('./components/ong/conjuntas/conjuntas').then(m => m.Conjuntas)
          },
          {
            path: 'ofertas-conjuntas/nueva',
            loadComponent: () => import('./components/ong/conjunta-form/conjunta-form').then(m => m.ConjuntaForm)
          },
          {
            path: 'ofertas-conjuntas/:id',
            loadComponent: () => import('./components/ong/detalle-conjunta/detalle-conjunta').then(m => m.DetalleConjunta)
          },
          {
            path: 'notificaciones',
            loadComponent: () => import('./components/ong/notificaciones/notificaciones').then(m => m.Notificaciones)
          },
          {
            path: 'inventario',
            loadComponent: () => import('./components/ong/inventario/inventario').then(m => m.Inventario)
          }
        ]
      },
      {
        path: 'auditor',
        canActivate: [rolGuard('AUDITOR')],
        loadComponent: () => import('./components/auditor/dashboard/dashboard').then(m => m.DashboardAuditor)
      },
      // Rutas anteriores: se redirige a la pantalla del rol del usuario
      { path: 'emergencia', redirectTo: aInicio },
      { path: 'ofertas', redirectTo: aInicio },
      { path: 'necesidades', redirectTo: aInicio },
      { path: '**', redirectTo: aInicio }
    ]
  }
];
