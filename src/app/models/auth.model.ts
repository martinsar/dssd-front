export type RolUsuario = 'OPERADOR_MUNICIPAL' | 'COORDINADOR' | 'ONG' | 'AUDITOR';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UsuarioSesion {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  organizacionId: number | null;
  organizacionNombre: string | null;
}

export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: UsuarioSesion;
}

export interface SesionActual {
  expiraEn: string;
  usuario: UsuarioSesion;
}
