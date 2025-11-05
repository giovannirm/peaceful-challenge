IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'peaceful_db')
BEGIN
    CREATE DATABASE peaceful_db;
END
GO

USE peaceful_db;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employees')
BEGIN
    CREATE TABLE employees (
        id INT PRIMARY KEY IDENTITY(1,1),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        document_number VARCHAR(20) NOT NULL UNIQUE
    );
END
GO

    INSERT INTO employees (first_name, last_name, document_number) VALUES 
    ('Juan', 'Pérez', '12345678'),
    ('María', 'García', '87654321'),
    ('Carlos', 'López', '11223344'),
    ('Ana', 'Martínez', '55667788'),
    ('Luis', 'Rodríguez', '99887766');

GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'attendances')
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
END
GO

GO
