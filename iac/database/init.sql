-- Script de inicialización unificado para SQL Server
-- Compatible con: SQL Server local, Docker y Azure SQL Database
--
-- Para Docker: Se ejecuta con CREATE DATABASE y USE (ver docker-compose.yml)
-- Para Azure SQL: Se ejecuta directamente (Terraform ya creó la BD)

-- Crear tabla de empleados
-- Usando VARCHAR para comprobar si funciona con la collation y codificación correcta
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employees' AND type = 'U')
BEGIN
    CREATE TABLE employees (
        id INT PRIMARY KEY IDENTITY(1,1),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        document_number VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255) NULL
    );
    PRINT 'Tabla employees creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla employees ya existe';
END
GO

-- Insertar datos iniciales de empleados (solo si no existen)
-- Usando prefijo N'...' para convertir a la codepage de la collation
IF (SELECT COUNT(*) FROM employees) > 0
BEGIN
    PRINT 'Datos de empleados ya existen';
END
ELSE
BEGIN
    INSERT INTO employees (first_name, last_name, document_number, email) VALUES 
    (N'Giovanni', N'Rojas', N'73253070', N'giovanni.rojas.morales@outlook.com'),
    (N'María', N'García', N'87654321', N'maria.garcia@example.com'),
    (N'Carlos', N'López', N'11223344', N'carlos.lopez@example.com'),
    (N'Ana', N'Martínez', N'55667788', N'ana.martinez@example.com'),
    (N'Luis', N'Rodríguez', N'99887766', N'luis.rodriguez@example.com');
    PRINT 'Datos de empleados insertados exitosamente';
END
GO

-- Crear tabla de asistencias
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'attendances' AND type = 'U')
BEGIN
    CREATE TABLE attendances (
        id INT PRIMARY KEY IDENTITY(1,1),
        employee_id INT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN (N'check_in', N'check_out')),
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

