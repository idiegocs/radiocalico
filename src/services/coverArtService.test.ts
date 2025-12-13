import fetch from 'node-fetch';
import coverArtService from './coverArtService';
import { MusicBrainzSearchResponse } from '../types';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('CoverArtService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchCover', () => {
    it('should return cover URL when found in MusicBrainz', async () => {
      const mockMusicBrainzResponse: MusicBrainzSearchResponse = {
        created: '2024-01-01T00:00:00Z',
        count: 1,
        offset: 0,
        releases: [
          {
            id: 'release-id-123',
            title: 'Test Album'
          }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMusicBrainzResponse
        } as any)
        .mockResolvedValueOnce({
          ok: true
        } as any);

      const result = await coverArtService.searchCover('Test Artist', 'Test Song');

      expect(result).toEqual({
        coverUrl: 'https://coverartarchive.org/release/release-id-123/front-500',
        source: 'coverartarchive',
        release: 'Test Album'
      });
    });

    it('should return null when no releases found', async () => {
      const mockMusicBrainzResponse: MusicBrainzSearchResponse = {
        created: '2024-01-01T00:00:00Z',
        count: 0,
        offset: 0,
        releases: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMusicBrainzResponse
      } as any);

      const result = await coverArtService.searchCover('Unknown Artist', 'Unknown Song');

      expect(result).toEqual({
        coverUrl: null,
        source: 'none',
        release: null
      });
    });

    it('should try multiple releases if first one has no cover', async () => {
      const mockMusicBrainzResponse: MusicBrainzSearchResponse = {
        created: '2024-01-01T00:00:00Z',
        count: 2,
        offset: 0,
        releases: [
          {
            id: 'release-id-1',
            title: 'Album 1'
          },
          {
            id: 'release-id-2',
            title: 'Album 2'
          }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMusicBrainzResponse
        } as any)
        .mockResolvedValueOnce({
          ok: false
        } as any)
        .mockResolvedValueOnce({
          ok: true
        } as any);

      const result = await coverArtService.searchCover('Test Artist', 'Test Song');

      expect(result.coverUrl).toBe('https://coverartarchive.org/release/release-id-2/front-500');
      expect(result.release).toBe('Album 2');
    });

    it('should handle MusicBrainz API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503
      } as any);

      await expect(
        coverArtService.searchCover('Test Artist', 'Test Song')
      ).rejects.toThrow('MusicBrainz API error: 503');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        coverArtService.searchCover('Test Artist', 'Test Song')
      ).rejects.toThrow('Network error');
    });

    it('should return none when all releases have no cover art', async () => {
      const mockMusicBrainzResponse: MusicBrainzSearchResponse = {
        created: '2024-01-01T00:00:00Z',
        count: 1,
        offset: 0,
        releases: [
          {
            id: 'release-id-1',
            title: 'Album 1'
          }
        ]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMusicBrainzResponse
        } as any)
        .mockResolvedValueOnce({
          ok: false
        } as any);

      const result = await coverArtService.searchCover('Test Artist', 'Test Song');

      expect(result).toEqual({
        coverUrl: null,
        source: 'none',
        release: null
      });
    });
  });

  describe('searchSpotify', () => {
    it('should throw not implemented error', async () => {
      await expect(
        coverArtService.searchSpotify('Test Artist', 'Test Song')
      ).rejects.toThrow('Spotify integration not implemented yet');
    });
  });

  describe('searchLastFm', () => {
    it('should throw not implemented error', async () => {
      await expect(
        coverArtService.searchLastFm('Test Artist', 'Test Song')
      ).rejects.toThrow('Last.fm integration not implemented yet');
    });
  });
});
