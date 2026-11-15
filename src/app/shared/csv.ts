// [Entrega final] Exportación a CSV del lado del cliente (compatible con Excel)
export interface ColumnaCsv<T> {
  titulo: string;
  valor: (fila: T) => string | number | null;
}

// Se escapa el valor: comillas dobles duplicadas y entre comillas si hace falta
export function escaparCsv(valor: string | number | null | undefined): string {
  let texto = valor === null || valor === undefined ? '' : String(valor);
  // [Entrega final] Se neutralizan fórmulas para Excel
  if (typeof valor === 'string' && /^[=+\-@\t\r]/.test(texto)) {
    texto = "'" + texto;
  }
  if (/[";\r\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

// Se arma el contenido con BOM y separador punto y coma
export function armarCsv<T>(columnas: ColumnaCsv<T>[], filas: T[]): string {
  const encabezado = columnas.map(c => escaparCsv(c.titulo)).join(';');
  const cuerpo = filas.map(f => columnas.map(c => escaparCsv(c.valor(f))).join(';'));
  return '﻿' + [encabezado, ...cuerpo].join('\r\n');
}

// Se descarga el archivo con un enlace temporal
export function exportarCsv<T>(nombreArchivo: string, columnas: ColumnaCsv<T>[], filas: T[]): void {
  const blob = new Blob([armarCsv(columnas, filas)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
