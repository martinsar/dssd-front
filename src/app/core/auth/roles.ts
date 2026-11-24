// [Entrega final] Perfiles, prefijos de ruta y menú de cada rol
import { Rol } from '../../models/sesion.model';

export const NOMBRE_ROL: Record<Rol, string> = {
  OPERADOR_MUNICIPAL: 'Operador municipal',
  COORDINADOR: 'Centro Coordinador',
  ONG: 'Representante de ONG',
  AUDITOR: 'Auditor'
};

export const PREFIJO_ROL: Record<Rol, string> = {
  OPERADOR_MUNICIPAL: 'municipio',
  COORDINADOR: 'coordinador',
  ONG: 'ong',
  AUDITOR: 'auditor'
};

export interface ItemMenu {
  etiqueta: string;
  ruta: string;
  exacto?: boolean;
}

export const MENU_POR_ROL: Record<Rol, ItemMenu[]> = {
  OPERADOR_MUNICIPAL: [
    { etiqueta: 'Mis emergencias', ruta: '/municipio', exacto: true },
    { etiqueta: 'Registrar emergencia', ruta: '/municipio/nueva' }
  ],
  COORDINADOR: [
    { etiqueta: 'Monitoreo', ruta: '/coordinador', exacto: true },
    { etiqueta: 'Convocatorias', ruta: '/coordinador/convocatorias' }
  ],
  ONG: [
    { etiqueta: 'Convocatorias', ruta: '/ong', exacto: true },
    { etiqueta: 'Mis ofertas', ruta: '/ong/ofertas' },
    { etiqueta: 'Ofertas conjuntas', ruta: '/ong/ofertas-conjuntas' },
    { etiqueta: 'Notificaciones', ruta: '/ong/notificaciones' },
    { etiqueta: 'Inventario', ruta: '/ong/inventario' }
  ],
  AUDITOR: [
    { etiqueta: 'Tablero Auditor', ruta: '/auditor', exacto: true },
    { etiqueta: 'Control de emergencias', ruta: '/auditor/emergencias' }
  ]
};
