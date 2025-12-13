import { Pool } from 'pg';

// Mock pg module
jest.mock('pg');

describe('Database Configuration', () => {
  it('should export a pool instance', () => {
    const pool = require('./database').default;

    expect(pool).toBeDefined();
  });

  it('should have a query method', () => {
    const pool = require('./database').default;

    expect(pool.query).toBeDefined();
    expect(typeof pool.query).toBe('function');
  });

  it('should be a PostgreSQL pool', () => {
    const pool = require('./database').default;

    // Check that it has pool-like properties
    expect(pool.on).toBeDefined();
  });
});
