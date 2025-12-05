/**
 * Tipo para una canción en la base de datos
 */
export interface Song {
  id: number;
  title: string;
  artist: string;
  audio_file: string;
  image_url: string | null;
  description: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  genre: string | null;
  duration: number | null;
  votes: number;
  play_count: number;
  created_at: Date;
}

/**
 * Respuesta estándar de la API
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

/**
 * Resultado de búsqueda de carátula de álbum
 */
export interface CoverSearchResult {
  coverUrl: string | null;
  source: 'coverartarchive' | 'spotify' | 'lastfm' | 'none';
  release: string | null;
}

/**
 * Release de MusicBrainz
 */
export interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit'?: Array<{
    name: string;
    artist: {
      id: string;
      name: string;
    };
  }>;
  date?: string;
  country?: string;
}

/**
 * Respuesta de búsqueda de MusicBrainz
 */
export interface MusicBrainzSearchResponse {
  created: string;
  count: number;
  offset: number;
  releases: MusicBrainzRelease[];
}

/**
 * Parámetros para crear una nueva canción
 */
export interface CreateSongParams {
  title: string;
  artist: string;
  audio_file: string;
  image_url?: string;
  description?: string;
  spotify_url?: string;
  youtube_url?: string;
  genre?: string;
  duration?: number;
}

/**
 * Configuración de la base de datos
 */
export interface DatabaseConfig {
  connectionString: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}
