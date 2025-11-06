/**
 * Constantes de base de datos
 * Nombres de tablas y columnas para evitar magic strings
 */
export const DATABASE = {
  TABLES: {
    EMPLOYEES: 'employees',
    ATTENDANCES: 'attendances',
  },
  COLUMNS: {
    EMPLOYEE: {
      ID: 'id',
      FIRST_NAME: 'first_name',
      LAST_NAME: 'last_name',
      DOCUMENT_NUMBER: 'document_number',
      EMAIL: 'email',
    },
    ATTENDANCE: {
      ID: 'id',
      EMPLOYEE_ID: 'employee_id',
      TYPE: 'type',
      LATITUDE: 'latitude',
      LONGITUDE: 'longitude',
      RECORD_TIME: 'record_time',
      CREATED_AT: 'created_at',
    },
  },
} as const;

