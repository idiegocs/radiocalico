-- Eliminar canciones de ejemplo
DELETE FROM songs;

-- Reiniciar el contador de ID
ALTER SEQUENCE songs_id_seq RESTART WITH 1;

-- Insertar canciones reales
INSERT INTO songs (title, artist, description, genre, duration, image_url, audio_file, spotify_url, youtube_url) VALUES
(
    'Golden',
    'KPop Demon Hunters',
    'Un explosivo tema de K-Pop que fusiona energía electrónica con elementos de hip-hop y rap. Esta canción destaca por su coreografía dinámica y su producción de alta calidad que captura la esencia del K-Pop moderno.',
    'K-Pop',
    '3:28',
    '/images/placeholder-1.svg',
    '/audio/golden.mp3',
    'https://open.spotify.com/search/Golden%20KPop%20Demon%20Hunters',
    'https://www.youtube.com/watch?v=yebNIHKAC4A'
),

(
    'Abracadabra',
    'Lady Gaga',
    'Una pista hipnótica y mágica de la icónica Lady Gaga que combina elementos de dance-pop con letras misteriosas y envolventes. La canción presenta una producción sofisticada con beats electrónicos cautivadores y la inconfundible voz de Gaga.',
    'Dance Pop',
    '4:12',
    '/images/placeholder-2.svg',
    '/audio/abracadabra.mp3',
    'https://open.spotify.com/search/Abracadabra%20Lady%20Gaga',
    'https://www.youtube.com/watch?v=vBynw9Isr28'
),

(
    'Clair Obscur: Expedition 33 - Lumière',
    'Lumière',
    'Una composición cinematográfica épica que transporta al oyente a un viaje de exploración fantástica. Con orquestaciones magistrales y atmósferas envolventes, esta pieza musical captura la esencia de la aventura y el descubrimiento en un mundo misterioso.',
    'Soundtrack',
    '4:35',
    '/images/placeholder-3.svg',
    '/audio/lumiere.mp3',
    'https://open.spotify.com/search/Clair%20Obscur%20Expedition%2033%20Lumière',
    'https://www.youtube.com/watch?v=LpNVf8sczqU'
);
