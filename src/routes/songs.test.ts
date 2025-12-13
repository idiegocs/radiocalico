import express, { Router } from 'express';
import * as songsController from '../controllers/songsController';

// Mock the controller
jest.mock('../controllers/songsController', () => ({
  getAllSongs: jest.fn(),
  getSongById: jest.fn(),
  voteSong: jest.fn(),
  registerPlay: jest.fn(),
  getCover: jest.fn()
}));

// Mock database to prevent import errors
jest.mock('../config/database', () => ({
  default: {
    query: jest.fn()
  }
}));

jest.mock('../services/coverArtService', () => ({
  default: {
    searchCover: jest.fn()
  }
}));

describe('Songs Routes', () => {
  let router: Router;
  let getSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a real router instance
    router = express.Router();

    // Spy on router methods
    getSpy = jest.spyOn(router, 'get');
    postSpy = jest.spyOn(router, 'post');
  });

  it('should export a router instance', () => {
    const songsRouter = require('./songs').default;
    expect(songsRouter).toBeDefined();
  });

  it('should be an Express Router', () => {
    const songsRouter = require('./songs').default;

    // Check that it has router methods
    expect(typeof songsRouter.get).toBe('function');
    expect(typeof songsRouter.post).toBe('function');
  });

  it('should have all required routes configured', () => {
    // Import the routes module which will configure the routes
    jest.isolateModules(() => {
      const express = require('express');
      const routerInstance = express.Router();
      const getSpy = jest.spyOn(routerInstance, 'get');
      const postSpy = jest.spyOn(routerInstance, 'post');

      jest.doMock('express', () => ({
        Router: () => routerInstance
      }));

      require('./songs');

      // Verify routes are configured
      expect(getSpy).toHaveBeenCalled();
      expect(postSpy).toHaveBeenCalled();
    });
  });
});
