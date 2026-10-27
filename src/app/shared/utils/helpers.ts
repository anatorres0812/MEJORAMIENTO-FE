/** Genera las páginas a mostrar en la paginación (máx. 7) */
export function generarPaginas(actual: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas: number[] = [];
  const start = Math.max(2, actual - 2);
  const end = Math.min(total - 1, actual + 2);
  paginas.push(1);
  if (start > 2) paginas.push(-1); // ellipsis
  for (let i = start; i <= end; i++) paginas.push(i);
  if (end < total - 1) paginas.push(-1);
  paginas.push(total);
  return paginas;
}

/** Formatea una fecha ISO a dd/mm/yyyy */
export function formatearFecha(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Calcula la edad a partir de fecha de nacimiento */
export function calcularEdad(fechaNac: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/** Genera un código único simple */
export function generarCodigo(prefijo: string, id: number): string {
  return `${prefijo}-${String(id).padStart(3, '0')}`;
}
