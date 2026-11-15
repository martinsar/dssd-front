// [Entrega final] Niveles de gravedad y su badge
export const NIVELES_GRAVEDAD = ['Bajo', 'Medio', 'Alto', 'Crítico'] as const;

const BADGE_POR_NIVEL: Record<string, string> = {
  bajo: 'badge-bajo',
  medio: 'badge-medio',
  alto: 'badge-alto',
  critico: 'badge-critico'
};

// Se devuelve la clase del badge según el nivel (sin importar mayúsculas ni tildes)
export function claseGravedad(nivel: string | null | undefined): string {
  const clave = (nivel ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return BADGE_POR_NIVEL[clave] ?? '';
}
