import { armarCsv, escaparCsv } from './csv';

describe('csv', () => {
  it('escapa comillas y separadores', () => {
    expect(escaparCsv('dice "hola"')).toBe('"dice ""hola"""');
    expect(escaparCsv('a;b')).toBe('"a;b"');
    expect(escaparCsv(null)).toBe('');
    expect(escaparCsv(5)).toBe('5');
  });

  it('arma el contenido con BOM y punto y coma', () => {
    const csv = armarCsv(
      [
        { titulo: 'Zona', valor: (f: { z: string; n: number }) => f.z },
        { titulo: 'Cantidad', valor: f => f.n }
      ],
      [{ z: 'San Carlos', n: 3 }]
    );
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Zona;Cantidad\r\nSan Carlos;3');
  });

  it('neutraliza textos que parecen fórmulas', () => {
    for (const texto of ['=SUMA(A1)', '+1', '-1+2', '@cmd']) {
      expect(escaparCsv(texto)).toBe("'" + texto);
    }
    expect(escaparCsv(-5)).toBe('-5');
    expect(escaparCsv('Agua = vida')).toBe('Agua = vida');
  });
});
