-- Agregar columna de votos a la tabla songs
ALTER TABLE songs ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;

-- Crear índice para mejorar rendimiento en consultas ordenadas por votos
CREATE INDEX IF NOT EXISTS idx_songs_votes ON songs(votes DESC);

-- Actualizar las canciones existentes para tener 0 votos
UPDATE songs SET votes = 0 WHERE votes IS NULL;
