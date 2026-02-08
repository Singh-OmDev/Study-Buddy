import request from 'supertest';
import { jest } from '@jest/globals';

// Mock Redis BEFORE importing app
jest.unstable_mockModule('../src/config/redis.js', () => ({
    default: {
        status: 'enabled',
        get: jest.fn(),
        setex: jest.fn(),
        del: jest.fn()
    }
}));

// Mock Auth Middleware to bypass Clerk
jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = { _id: 'test_user_id' };
        next();
    }
}));

// Mock StudyLog model
jest.unstable_mockModule('../src/models/StudyLog.js', () => ({
    default: {
        find: jest.fn().mockResolvedValue([
            { subject: 'Test Subject', topic: 'Test Topic', durationMinutes: 60, date: new Date().toISOString() }
        ]),
        create: jest.fn().mockResolvedValue({ _id: 'new_log' })
    }
}));

const redis = (await import('../src/config/redis.js')).default;
const app = (await import('../src/app.js')).default;

describe('Redis Caching', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/study/stats should check cache first', async () => {
        // Simulate Cache Miss
        redis.get.mockResolvedValue(null);

        await request(app).get('/api/study/stats');

        expect(redis.get).toHaveBeenCalledWith('stats:test_user_id');
        expect(redis.setex).toHaveBeenCalled(); // Should save to cache after miss
    });

    it('GET /api/study/stats should return cached data if available', async () => {
        // Simulate Cache Hit
        const cachedStats = {
            totalLogs: 10,
            totalHours: "5.0",
            subjectStats: {},
            streak: 2,
            recentLogs: []
        };
        redis.get.mockResolvedValue(JSON.stringify(cachedStats));

        const res = await request(app).get('/api/study/stats');

        expect(redis.get).toHaveBeenCalledWith('stats:test_user_id');
        expect(res.body).toEqual(cachedStats);
        expect(redis.setex).not.toHaveBeenCalled(); // Should NOT setex on hit
    });
});
