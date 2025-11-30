const fetch = require('node-fetch');

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
  constructor() {
    this.userAgent = 'RadioCalico/1.0.0 (contact@radiocalico.com)';
  }

  /**
   * Buscar carátula de álbum
   * @param {string} artist - Nombre del artista
   * @param {string} title - Título de la canción
   * @returns {Promise<Object>} - Resultado con coverUrl, source y release
   */
  async searchCover(artist, title) {
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
      console.error('Error en búsqueda de carátula:', error.message);
      throw error;
    }
  }

  /**
   * Buscar en MusicBrainz + Cover Art Archive
   * @param {string} artist - Nombre del artista
   * @param {string} title - Título de la canción
   * @returns {Promise<Object>}
   */
  async searchMusicBrainz(artist, title) {
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

      const mbData = await mbResponse.json();

      if (mbData.releases && mbData.releases.length > 0) {
        // Intentar con cada release hasta encontrar una carátula
        for (const release of mbData.releases) {
          const coverUrl = await this.getCoverArtArchiveUrl(release.id);

          if (coverUrl) {
            console.log(`✨ Carátula encontrada para "${artist} - ${title}"`);
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
      console.error('Error en búsqueda de MusicBrainz:', error.message);
      throw error;
    }
  }

  /**
   * Obtener URL de carátula desde Cover Art Archive
   * @param {string} releaseId - ID del release en MusicBrainz
   * @returns {Promise<string|null>}
   */
  async getCoverArtArchiveUrl(releaseId) {
    try {
      const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;
      const coverCheck = await fetch(coverUrl, { method: 'HEAD' });

      if (coverCheck.ok) {
        return coverUrl;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Placeholder para futura integración con Spotify
   * @param {string} artist - Nombre del artista
   * @param {string} title - Título de la canción
   * @returns {Promise<Object>}
   */
  async searchSpotify(artist, title) {
    // TODO: Implementar búsqueda en Spotify API
    // Requiere: spotify-web-api-node o similar
    throw new Error('Spotify integration not implemented yet');
  }

  /**
   * Placeholder para futura integración con Last.fm
   * @param {string} artist - Nombre del artista
   * @param {string} title - Título de la canción
   * @returns {Promise<Object>}
   */
  async searchLastFm(artist, title) {
    // TODO: Implementar búsqueda en Last.fm API
    throw new Error('Last.fm integration not implemented yet');
  }
}

// Exportar instancia singleton
module.exports = new CoverArtService();
