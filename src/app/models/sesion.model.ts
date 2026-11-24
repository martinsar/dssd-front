// [Entrega final] Sesión del usuario y perfiles de la aplicación
export type Rol = 'OPERADOR_MUNICIPAL' | 'COORDINADOR' | 'ONG' | 'AUDITOR';

export interface UsuarioSesion {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  organizacionId: number | null;
  organizacionNombre: string | null;
}

export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: UsuarioSesion;
}

export interface SesionResponse {
  expiraEn: string;
  usuario: UsuarioSesion;
}
