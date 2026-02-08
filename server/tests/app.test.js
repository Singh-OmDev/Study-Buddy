import request from 'supertest';
import app from '../src/app.js';

describe('GET /', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('AI Study Buddy API is running...');
    });
});

describe('GET /api/unknown', () => {
    it('should return 404', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.statusCode).toBe(404);
    });
});
