// [Entrega final] Traducción de errores HTTP a mensajes para el usuario
import { HttpErrorResponse } from '@angular/common/http';

// Se arma el mensaje a partir de la respuesta de error del servidor
export function mensajeDeError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }
  if (err.status === 0) {
    return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';
  }

  // Se toma el texto del cuerpo {"error": "mensaje"} si viene
  const cuerpo = err.error;
  let detalle: string | null = null;
  if (cuerpo && typeof cuerpo === 'object' && typeof cuerpo.error === 'string' && cuerpo.error.trim()) {
    detalle = cuerpo.error;
  } else if (typeof cuerpo === 'string' && cuerpo.trim() && !cuerpo.trim().startsWith('<')) {
    detalle = cuerpo;
  }

  if (err.status === 401) {
    return detalle ?? 'Tu sesión expiró. Ingresá nuevamente.';
  }
  if (err.status === 403) {
    return detalle ?? 'No tenés permisos para realizar esta acción.';
  }
  if (err.status === 502) {
    if (detalle) {
      console.warn('Error del servicio de procesos:', detalle);
    }
    return 'El servicio de gestión de procesos no respondió. Intentá nuevamente en unos minutos.';
  }
  return detalle ?? `Ocurrió un error (código ${err.status}).`;
}

// Se indica si el error es un 404
export function esNoEncontrado(err: unknown): boolean {
  return err instanceof HttpErrorResponse && err.status === 404;
}
