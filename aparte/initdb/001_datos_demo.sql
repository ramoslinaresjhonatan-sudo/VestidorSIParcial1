CREATE TABLE estudiantes_demo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    curso VARCHAR(50) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO estudiantes_demo (nombre, curso)
VALUES
    ('Ana Perez', 'Primero A'),
    ('Luis Gomez', 'Segundo B');
