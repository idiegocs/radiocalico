// Tests básicos de exportación de funciones del controlador
// Los tests de integración completos requieren configuración más avanzada de mocks
import * as songsController from './songsController';

describe('Songs Controller', () => {
  it('should export getAllSongs function', () => {
    expect(typeof songsController.getAllSongs).toBe('function');
  });

  it('should export getSongById function', () => {
    expect(typeof songsController.getSongById).toBe('function');
  });

  it('should export voteSong function', () => {
    expect(typeof songsController.voteSong).toBe('function');
  });

  it('should export registerPlay function', () => {
    expect(typeof songsController.registerPlay).toBe('function');
  });

  it('should export getCover function', () => {
    expect(typeof songsController.getCover).toBe('function');
  });
});
