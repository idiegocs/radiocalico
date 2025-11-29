-- Crear tabla de canciones
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    duration VARCHAR(10),
    image_url VARCHAR(500),
    audio_file VARCHAR(500),
    spotify_url VARCHAR(500),
    youtube_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO songs (title, artist, description, genre, duration, image_url, audio_file, spotify_url, youtube_url) VALUES
('Melodías del Amanecer', 'Luna Martínez', 'Una composición suave y relajante perfecta para comenzar el día con energía positiva. Esta canción combina instrumentos acústicos con toques electrónicos modernos.', 'Pop Acústico', '3:45', '/images/placeholder-1.svg', '/audio/sample1.mp3', 'https://open.spotify.com', 'https://music.youtube.com'),

('Ritmos de la Ciudad', 'Los Urbanos', 'Un viaje sonoro por las calles de la ciudad, capturando la esencia del movimiento urbano con beats contagiosos y letras que hablan de la vida cotidiana.', 'Rock Urbano', '4:12', '/images/placeholder-2.svg', '/audio/sample2.mp3', 'https://open.spotify.com', 'https://music.youtube.com'),

('Susurros del Viento', 'María del Mar', 'Perfecta para momentos de meditación y relajación. Esta pieza musical ha sido diseñada para crear un ambiente tranquilo con sonidos de la naturaleza.', 'Ambiente', '5:20', '/images/placeholder-3.svg', '/audio/sample3.mp3', 'https://open.spotify.com', 'https://music.youtube.com'),

('Baila Conmigo', 'DJ Tropicana', 'Un ritmo latino explosivo que te hará mover el cuerpo sin parar. Fusión perfecta de salsa, reggaeton y música electrónica.', 'Latino', '3:30', '/images/placeholder-1.svg', '/audio/sample4.mp3', 'https://open.spotify.com', 'https://music.youtube.com'),

('Noches de Jazz', 'The Smooth Collective', 'Una interpretación moderna del jazz clásico con improvisaciones magistrales de saxofón y piano. Ideal para veladas sofisticadas.', 'Jazz', '6:15', '/images/placeholder-2.svg', '/audio/sample5.mp3', 'https://open.spotify.com', 'https://music.youtube.com'),

('Ecos del Pasado', 'Vintage Sound', 'Una canción nostálgica que te transportará a épocas pasadas con su sonido retro y letras profundas sobre memorias y recuerdos.', 'Indie Rock', '4:05', '/images/placeholder-3.svg', '/audio/sample6.mp3', 'https://open.spotify.com', 'https://music.youtube.com');

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
