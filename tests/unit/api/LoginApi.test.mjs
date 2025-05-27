import { jest, expect, test,afterEach, describe, beforeEach,global,require} from '@jest/globals';
global.fetch = jest.fn();

describe('Login API', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('should successfully log in a user with valid credentials', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'john@example.com',
        username: 'johndoe',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    const result = await login(mockCredentials);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
    expect(result).toEqual(mockResponse);
    expect(result.user).toHaveProperty('id');
    expect(result.user).toHaveProperty('email');
    expect(result.user).toHaveProperty('username');
    expect(result.user).not.toHaveProperty('password');
  });

  test('should handle login failure with invalid credentials', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'WrongPassword',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid credentials',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid credentials');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login failure with missing email', async () => {
    const mockCredentials = {
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid email or password',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid email or password');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login failure with missing password', async () => {
    const mockCredentials = {
      email: 'john@example.com',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid email or password',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid email or password');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login failure with non-existent email', async () => {
    const mockCredentials = {
      email: 'nonexistent@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid email or password',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid email or password');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login with empty credentials object', async () => {
    const mockCredentials = {};

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid email or password',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid email or password');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login server error', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Internal server error',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Internal server error');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login with case-sensitive email', async () => {
    const mockCredentials = {
      email: 'John@Example.com',
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'John@Example.com',
        username: 'johndoe',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    const result = await login(mockCredentials);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle login with malformed JSON response', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Invalid JSON')),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid JSON');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login with special characters in password', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'P@ssw0rd!@#$%',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'john@example.com',
        username: 'johndoe',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    const result = await login(mockCredentials);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle login with rate limiting', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({
        error: 'Too Many Requests',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Too Many Requests');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });


  test('should handle login with empty strings for all fields', async () => {
    const mockCredentials = {
      email: '',
      password: '',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid email or password',
      }),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Invalid email or password');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });

  test('should handle login with no response body', async () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { login } = require('../../../frontend/src/utils/apiCalls');
    await expect(login(mockCredentials)).rejects.toThrow('Login failed');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCredentials),
      }
    );
  });
});