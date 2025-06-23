import { jest, expect, it, describe, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../../../backend/api/utils/dbConnection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = await import('../../../../backend/api/utils/dbConnection');
const {
  uniqueUsername,
  uniqueEmail,
  updateUserDetails,
  updateUserPassword,
} = await import('../../../../backend/api/controllers/dbController');

describe('User details update functions', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: '',
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    pool.query.mockReset();
  });

  describe('uniqueUsername', () => {
    it('should return true if username exists', async () => {
      req.params.username = 'existingUser';
      pool.query.mockResolvedValue({ rows: [{}] });

      await uniqueUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: true });
    });

    it('should return false if username does not exist', async () => {
      req.params.username = 'newUser';
      pool.query.mockResolvedValue({ rows: [] });

      await uniqueUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: false });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      await uniqueUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('uniqueEmail', () => {
    it('should return true if email exists', async () => {
      req.params.email = 'existing@example.com';
      pool.query.mockResolvedValue({ rows: [{}] });

      await uniqueEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: true });
    });

    it('should return false if email does not exist', async () => {
      req.params.email = 'new@example.com';
      pool.query.mockResolvedValue({ rows: [] });

      await uniqueEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: false });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      await uniqueEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateUserDetails', () => {
    it('should update user and return 200 if successful', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Jane',
        surname: 'Doe',
        username: 'janedoe',
        email: 'jane@example.com',
      };

      const mockUser = {
        userID: '1',
        username: 'janedoe',
        name: 'Jane',
        surname: 'Doe',
        email: 'jane@example.com',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      await updateUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully.',
        user: mockUser,
      });
    });

    it('should return 404 if no user is updated', async () => {
      req.params.id = '99';
      req.body = {
        name: 'Ghost',
        surname: 'User',
        username: 'ghost',
        email: 'ghost@example.com',
      };

      pool.query.mockResolvedValue({ rows: [] });

      await updateUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return 500 on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB failure'));

      await updateUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
    });
  });

  describe('updateUserPassword', () => {
    it('should update password and return 200 if successful', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Jane',
        surname: 'Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'newpass123',
      };

      const mockUser = {
        userID: '1',
        username: 'janedoe',
        name: 'Jane',
        surname: 'Doe',
        email: 'jane@example.com',
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      await updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully.',
        user: mockUser,
      });
    });

    it('should return 404 if no user is updated', async () => {
      req.params.id = '99';
      req.body = {
        name: 'Ghost',
        surname: 'User',
        username: 'ghost',
        email: 'ghost@example.com',
        password: 'ghostpass',
      };

      pool.query.mockResolvedValue({ rows: [] });

      await updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should return 500 on DB error', async () => {
      pool.query.mockRejectedValue(new Error('DB failure'));

      await updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
    });
  });
});