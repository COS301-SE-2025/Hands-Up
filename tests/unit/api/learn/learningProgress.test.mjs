import { jest, expect, it, describe, beforeEach, beforeAll} from '@jest/globals';
let pool, learningProgress

beforeAll(async () => {
  const dbModule = await import('../../../../backend/api/utils/dbConnection.js');
  const controllerModule = await import('../../../../backend/api/controllers/dbController.js');

  pool = dbModule.pool;
  ({ learningProgress } = controllerModule);
});

jest.unstable_mockModule('../../../../backend/api/utils/dbConnection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('learningProgress controller', () => {
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

  describe('GET method', () => {
    it('should return 400 if username is missing', async () => {
      req.method = 'GET';

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Username is required',
      });
    });

    it('should return 404 if user not found', async () => {
      req.method = 'GET';
      req.params.username = 'unknownUser';

      pool.query.mockResolvedValue({ rowCount: 0 });

      await learningProgress(req, res);

      expect(pool.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found',
      });
    });

    it('should return 200 and progress data if user found', async () => {
      req.method = 'GET';
      req.params.username = 'testuser';

      const mockData = [{ lessonsCompleted: 10, signsLearned: 5, streak: 3, currentLevel: 'Silver' }];

      pool.query.mockResolvedValue({ rowCount: 1, rows: mockData });

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Learning progress retrieved successfully',
        data: mockData,
      });
    });

    it('should return 500 on database error (GET)', async () => {
      req.method = 'GET';
      req.params.username = 'testuser';

      pool.query.mockRejectedValue(new Error('DB failure'));

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal Server Error',
      });
    });
  });

  describe('PUT method', () => {
    it('should return 400 if username or progressData missing', async () => {
      req.method = 'PUT';
      req.params.username = '';
      req.body = {};

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Username and progress data are required',
      });
    });

    it('should return 404 if update affected no rows', async () => {
      req.method = 'PUT';
      req.params.username = 'testuser';
      req.body = { lessonsCompleted: 5, signsLearned: 2, streak: 1 };

      pool.query.mockResolvedValue({ rowCount: 0 });

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found or no progress updated',
      });
    });

    it('should return 200 if update is successful', async () => {
      req.method = 'PUT';
      req.params.username = 'testuser';
      req.body = { lessonsCompleted: 5, signsLearned: 2, streak: 1 };

      pool.query.mockResolvedValue({ rowCount: 1 });

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Learning progress updated successfully',
      });
    });

    it('should return 500 on database error (PUT)', async () => {
      req.method = 'PUT';
      req.params.username = 'testuser';
      req.body = { lessonsCompleted: 5, signsLearned: 2, streak: 1 };

      pool.query.mockRejectedValue(new Error('DB failure'));

      await learningProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal Server Error',
      });
    });
  });
});
