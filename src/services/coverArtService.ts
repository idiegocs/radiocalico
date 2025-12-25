import fetch from 'node-fetch';
import { CoverSearchResult, MusicBrainzSearchResponse } from '../types';
import { log } from '../config/logger';

/**
 * Servicio para búsqueda de carátulas de álbumes
 *
 * Este servicio encapsula la lógica de búsqueda de carátulas,
 * permitiendo cambiar fácilmente el proveedor en el futuro.
 *
 * Proveedores soportados:
 * - MusicBrainz + Cover Art Archive (actual)
 *
 * Proveedores potenciales futuros:
 * - Spotify API
 * - Last.fm
 * - Discogs
 * - iTunes Search API
 */

class CoverArtService {
  private userAgent: string;

  constructor() {
    this.userAgent = 'RadioCalico/1.0.0 (contact@radiocalico.com)';
  }

  /**
   * Buscar carátula de álbum
   * @param artist - Nombre del artista
   * @param title - Título de la canción
   * @returns Resultado con coverUrl, source y release
   */
  async searchCover(artist: string, title: string): Promise<CoverSearchResult> {
    try {
      // Intentar con MusicBrainz
      const result = await this.searchMusicBrainz(artist, title);

      if (result.coverUrl) {
        return result;
      }

      // Aquí se pueden agregar más proveedores como fallback
      // const spotifyResult = await this.searchSpotify(artist, title);
      // if (spotifyResult.coverUrl) return spotifyResult;

      return {
        coverUrl: null,
        source: 'none',
        release: null
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Error en búsqueda de carátula', error, { artist, title });
      throw error;
    }
  }

  /**
   * Buscar en MusicBrainz + Cover Art Archive
   * @param artist - Nombre del artista
   * @param title - Título de la canción
   * @returns Resultado de búsqueda
   */
  private async searchMusicBrainz(artist: string, title: string): Promise<CoverSearchResult> {
    try {
      // Construir query de búsqueda
      const query = `artist:${artist} AND recording:${title}`;
      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://musicbrainz.org/ws/2/release/?query=${encodedQuery}&fmt=json&limit=5`;

      // Buscar en MusicBrainz
      const mbResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!mbResponse.ok) {
        throw new Error(`MusicBrainz API error: ${mbResponse.status}`);
      }

      const mbData = await mbResponse.json() as MusicBrainzSearchResponse;

      if (mbData.releases && mbData.releases.length > 0) {
        // Intentar con cada release hasta encontrar una carátula
        for (const release of mbData.releases) {
          const coverUrl = await this.getCoverArtArchiveUrl(release.id);

          if (coverUrl) {
            log.info('Carátula encontrada', { artist, title, source: 'Cover Art Archive' });
            return {
              coverUrl: coverUrl,
              source: 'coverartarchive',
              release: release.title
            };
          }
        }
      }

      return {
        coverUrl: null,
        source: 'none',
        release: null
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Error en búsqueda de MusicBrainz', error, { artist, title });
      throw error;
    }
  }

  /**
   * Obtener URL de carátula desde Cover Art Archive
   * @param releaseId - ID del release en MusicBrainz
   * @returns URL de la carátula o null si no se encuentra
   */
  private async getCoverArtArchiveUrl(releaseId: string): Promise<string | null> {
    try {
      const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;
      const coverCheck = await fetch(coverUrl, { method: 'HEAD' });

      if (coverCheck.ok) {
        return coverUrl;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Placeholder para futura integración con Spotify
   * @param _artist - Nombre del artista
   * @param _title - Título de la canción
   * @returns Resultado de búsqueda
   */
  async searchSpotify(_artist: string, _title: string): Promise<CoverSearchResult> {
    // TODO: Implementar búsqueda en Spotify API
    // Requiere: spotify-web-api-node o similar
    throw new Error('Spotify integration not implemented yet');
  }

  /**
   * Placeholder para futura integración con Last.fm
   * @param _artist - Nombre del artista
   * @param _title - Título de la canción
   * @returns Resultado de búsqueda
   */
  async searchLastFm(_artist: string, _title: string): Promise<CoverSearchResult> {
    // TODO: Implementar búsqueda en Last.fm API
    throw new Error('Last.fm integration not implemented yet');
  }
}

// Exportar instancia singleton
export default new CoverArtService();
