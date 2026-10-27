// Utilidades simples para leer/escribir arrays en localStorage.
// Si algo falla (navegador sin soporte, dato corrupto, etc.), se cae de vuelta a los valores por defecto sin romper la app.

export function cargarDesdeStorage<T>(clave: string, valoresPorDefecto: T[]): T[] {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado) {
      return JSON.parse(guardado) as T[];
    }
  } catch {
    // Ignorar errores de parseo o de acceso a localStorage
  }
  return [...valoresPorDefecto];
}

export function guardarEnStorage<T>(clave: string, datos: T[]): void {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch {
    // Si falla (ej. modo incógnito con storage bloqueado), la app sigue funcionando en memoria
  }
}

export function cargarValorDesdeStorage<T>(clave: string, valorPorDefecto: T): T {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado) {
      return JSON.parse(guardado) as T;
    }
  } catch {
    // Ignorar
  }
  return valorPorDefecto;
}

export function guardarValorEnStorage<T>(clave: string, valor: T): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Ignorar
  }
}

export function eliminarDeStorage(clave: string): void {
  try {
    localStorage.removeItem(clave);
  } catch {
    // Ignorar
  }
}