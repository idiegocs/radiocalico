-- Agregar columna de reproducciones a la tabla songs
ALTER TABLE songs ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

-- Crear índice para mejorar rendimiento en consultas ordenadas por reproducciones
CREATE INDEX IF NOT EXISTS idx_songs_play_count ON songs(play_count DESC);

-- Actualizar las canciones existentes para tener 0 reproducciones
UPDATE songs SET play_count = 0 WHERE play_count IS NULL;
