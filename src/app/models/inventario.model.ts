// [Entrega final] Inventario de recursos de la ONG
export interface InventarioItem {
  tipoRecursoId: number;
  tipoRecurso: string;
  cantidadDisponible: number;
  cantidadOfertada: number;
  cantidadComprometida: number;
  descripcion: string | null;
  fechaActualizacion: string | null;
}

export interface InventarioRequest {
  cantidadDisponible: number;
  descripcion: string;
}
