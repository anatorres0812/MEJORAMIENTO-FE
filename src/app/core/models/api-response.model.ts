export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// extractArray — normaliza CUALQUIER forma de respuesta de lista del backend
// Soporta:
//   • T[]                              (array plano)
//   • Page<T> de Spring Data           { content: T[], totalElements, ... }
//   • ApiResponse<T[]>                 { data: T[] }
//   • Wrapper OData-style              { value: T[], Count? }
//   • Wrapper genérico                 { items: T[] }
// ─────────────────────────────────────────────────────────────────────────────
export function extractArray<T>(respuesta: unknown): T[] {
  if (Array.isArray(respuesta)) return respuesta as T[];

  if (respuesta && typeof respuesta === 'object') {
    const r = respuesta as Record<string, unknown>;

    // Spring Data Page<T>
    if (Array.isArray(r['content']))  return r['content'] as T[];

    // ApiResponse<T[]>
    if (Array.isArray(r['data']))     return r['data'] as T[];

    // OData / Hibernate wrapper
    if (Array.isArray(r['value']))    return r['value'] as T[];

    // PagedResponse { items: [] }
    if (Array.isArray(r['items']))    return r['items'] as T[];
  }

  console.warn('extractArray: respuesta inesperada del backend', respuesta);
  return [];
}
