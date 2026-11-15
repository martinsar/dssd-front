// [Entrega final] Utilidades de fechas (formato local argentino)

// Se agregan los segundos a la fecha del input datetime-local
export function aIsoLocal(valor: string): string {
  return valor.length === 16 ? `${valor}:00` : valor;
}

// Se arma un texto como "en 2 días" a partir de la fecha de cierre
export function tiempoRestante(fechaIso: string | null | undefined): string {
  if (!fechaIso) {
    return '';
  }
  const ms = new Date(fechaIso).getTime() - Date.now();
  if (Number.isNaN(ms)) {
    return '';
  }
  if (ms <= 0) {
    return 'ya cerró';
  }
  const minutos = Math.floor(ms / 60000);
  if (minutos < 60) {
    return minutos <= 1 ? 'en menos de 1 minuto' : `en ${minutos} minutos`;
  }
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return horas === 1 ? 'en 1 hora' : `en ${horas} horas`;
  }
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'en 1 día' : `en ${dias} días`;
}
