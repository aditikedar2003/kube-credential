import request from 'supertest';
import app from '../src/index';

describe('Issuance Service', () => {
  const cred = { id: 'test-issuance-1', name: 'Aditi' };

  it('should issue a new credential', async () => {
    const res = await request(app).post('/issue').send(cred).set('Accept', 'application/json');
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('credHash');
  });

  it('should return already issued on duplicate', async () => {
    await request(app).post('/issue').send(cred);
    const res2 = await request(app).post('/issue').send(cred);
    expect(res2.status).toBe(200);
    expect(res2.body.message).toMatch(/already/);
  });

  it('should error on empty body', async () => {
    const res = await request(app).post('/issue').send({}).set('Accept', 'application/json');
    expect(res.status).toBe(400);
  });
});
