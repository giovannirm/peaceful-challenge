-- Script de inicialización unificado para SQL Server
-- Compatible con: SQL Server local, Docker y Azure SQL Database
--
-- Para Docker: Se ejecuta con CREATE DATABASE y USE (ver docker-compose.yml)
-- Para Azure SQL: Se ejecuta directamente (Terraform ya creó la BD)

-- Crear tabla de empleados
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employees' AND type = 'U')
BEGIN
    CREATE TABLE employees (
        id INT PRIMARY KEY IDENTITY(1,1),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        document_number VARCHAR(20) NOT NULL UNIQUE
    );
    PRINT 'Tabla employees creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla employees ya existe';
END
GO

-- Insertar datos iniciales de empleados (solo si no existen)
IF NOT EXISTS (SELECT 1 FROM employees WHERE document_number = '12345678')
BEGIN
    INSERT INTO employees (first_name, last_name, document_number) VALUES 
    ('Juan', 'Pérez', '12345678'),
    ('María', 'García', '87654321'),
    ('Carlos', 'López', '11223344'),
    ('Ana', 'Martínez', '55667788'),
    ('Luis', 'Rodríguez', '99887766');
    PRINT 'Datos de empleados insertados exitosamente';
END
ELSE
BEGIN
    PRINT 'Datos de empleados ya existen';
END
GO

-- Crear tabla de asistencias
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'attendances' AND type = 'U')
BEGIN
    CREATE TABLE attendances (
        id INT PRIMARY KEY IDENTITY(1,1),
        employee_id INT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('check_in', 'check_out')),
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        record_time DATETIME NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
    PRINT 'Tabla attendances creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla attendances ya existe';
END
GO

PRINT 'Inicialización de la base de datos completada';
GO

