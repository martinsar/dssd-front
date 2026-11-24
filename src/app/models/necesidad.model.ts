// [Entrega final] Lote de necesidades de una convocatoria
export interface TipoRecurso {
  id: number;
  nombre: string;
}

export interface Necesidad {
  id: number;
  cantidad: number;
  descripcion: string;
  fechaCreacion?: string;
  tipoRecurso?: TipoRecurso | null;
}
