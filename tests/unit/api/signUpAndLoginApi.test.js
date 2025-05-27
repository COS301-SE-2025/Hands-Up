// tests/unit/api/authApi.test.js
global.fetch = jest.fn();

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully sign up a user with valid data', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
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
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
    expect(result).toEqual(mockResponse);
    expect(result.user).toHaveProperty('id');
    expect(result.user).toHaveProperty('email');
    expect(result.user).toHaveProperty('username');
    expect(result.user).not.toHaveProperty('password');
  });

  test('should handle signup failure when email already exists', async () => {
    const mockUserData = {
      name: 'Jane',
      surname: 'Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'email already exists',
      }),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('email already exists');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
  });

  test('should handle signup failure when username already exists', async () => {
    const mockUserData = {
      name: 'Jane',
      surname: 'Smith',
      username: 'johndoe',
      email: 'new@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'username already exists',
      }),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('username already exists');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
  });

  test('should handle signup failure with missing fields', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: '', // Missing email
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
  });

  test('should handle signup network error', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('Network error');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
  });

  test('should handle signup with invalid email format', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'invalid-email', // Invalid email format
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required', // Current backend doesn't validate email format
      }),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
  });

  test('should handle signup with weak password', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'weak', // Potentially weak password
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
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle signup with malformed JSON response', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValueOnce(new SyntaxError('Invalid JSON')),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('Invalid JSON');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
  });

  test('should handle signup with unexpected server response', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: jest.fn().mockResolvedValueOnce({
        error: 'Service Unavailable',
      }),
    });

    const { signup } = require('../../../frontend/src/utils/apiCalls');
    await expect(signup(mockUserData)).rejects.toThrow('Service Unavailable');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
      }
    );
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
      json: jest.fn().mockResolvedValueOnce(mockResponse),
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
      json: jest.fn().mockResolvedValueOnce({
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
      json: jest.fn().mockResolvedValueOnce({
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
      json: jest.fn().mockResolvedValueOnce({
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
      json: jest.fn().mockResolvedValueOnce({
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
      json: jest.fn().mockResolvedValueOnce({
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
});
