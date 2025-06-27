import { jest, expect, test, afterEach, describe, beforeEach } from '@jest/globals';
import { signup } from '../../../../frontend/src/utils/apiCalls'; // Import the signup function

globalThis.fetch = jest.fn();

describe('Signup API', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
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

    await expect(signup(mockUserData)).rejects.toThrow('email already exists');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
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

    await expect(signup(mockUserData)).rejects.toThrow('username already exists');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup failure with missing fields (email)', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: '',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup failure with missing fields (password)', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: '',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup failure with missing fields (name)', async () => {
    const mockUserData = {
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup failure with missing fields (surname)', async () => {
    const mockUserData = {
      name: 'John',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup failure with missing fields (username)', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
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

    await expect(signup(mockUserData)).rejects.toThrow('Network error');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup with invalid email format', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'invalid-email',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup with weak password', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'weak',
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

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
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

    await expect(signup(mockUserData)).rejects.toThrow('Invalid JSON');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
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

    await expect(signup(mockUserData)).rejects.toThrow('Service Unavailable');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup with case-sensitive email', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe2',
      email: 'John@Example.com',
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'John@Example.com',
        username: 'johndoe2',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle signup with case-sensitive username', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'JohnDoe',
      email: 'john2@example.com',
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'john2@example.com',
        username: 'JohnDoe',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle signup with malicious input', async () => {
    const mockUserData = {
      name: '<script>alert("xss")</script>',
      surname: 'Doe',
      username: 'johndoe3',
      email: 'john3@example.com',
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'john3@example.com',
        username: 'johndoe3',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle signup with special characters in name', async () => {
    const mockUserData = {
      name: 'John@#$%',
      surname: 'Doe',
      username: 'johndoe4',
      email: 'john4@example.com',
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: 'john4@example.com',
        username: 'johndoe4',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle signup with long input strings', async () => {
    const longString = 'a'.repeat(1000);
    const mockUserData = {
      name: longString,
      surname: 'Doe',
      username: 'johndoe5',
      email: `john5${longString}@example.com`,
      password: 'Password123',
    };

    const mockResponse = {
      success: true,
      user: {
        id: 1,
        email: `john5${longString}@example.com`,
        username: 'johndoe5',
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await signup(mockUserData);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
    expect(result).toEqual(mockResponse);
  });

  test('should handle signup with rate limiting', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe6',
      email: 'john6@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: jest.fn().mockResolvedValueOnce({
        error: 'Too Many Requests',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('Too Many Requests');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });



  test('should handle signup with empty strings for all fields', async () => {
    const mockUserData = {
      name: '',
      surname: '',
      username: '',
      email: '',
      password: '',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        error: 'All fields are required',
      }),
    });

    await expect(signup(mockUserData)).rejects.toThrow('All fields are required');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });

  test('should handle signup with no response body', async () => {
    const mockUserData = {
      name: 'John',
      surname: 'Doe',
      username: 'johndoe9',
      email: 'john9@example.com',
      password: 'Password123',
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    await expect(signup(mockUserData)).rejects.toThrow('An unknown error occurred');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:2000/handsUPApi/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData),
        credentials: 'include',
      }
    );
  });
});