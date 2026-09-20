export interface Emergencia {
  id?: number;
  tipoDesastre: string;
  nivelGravedad: string;
  zonaAfectada: string;
  descripcion: string;
  estado?: string;
}