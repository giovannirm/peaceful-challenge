/**
 * Constantes para direcciones de ordenamiento en consultas
 * Centraliza valores de ordenamiento para evitar magic strings
 */
export const QUERY_ORDER = {
  ASC: 'ASC' as const,
  DESC: 'DESC' as const,
} as const;

/**
 * Constantes para campos de ordenamiento comunes
 */
export const ORDER_BY_FIELDS = {
  ID: 'id',
  RECORD_TIME: 'recordTime',
} as const;
