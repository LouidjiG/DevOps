import request from 'supertest';
import { app } from '../index.js';

describe('Health Check', () => {
    it('should return 200 OK', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });
});
