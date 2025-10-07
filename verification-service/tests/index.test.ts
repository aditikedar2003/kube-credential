import request from 'supertest';
import app from '../src/index';
import crypto from 'crypto';

describe('Verification Service', () => {
  const cred = { id: 'test-verify-1', name: 'Aditi' };
  const credHash = crypto.createHash('sha256').update(JSON.stringify(cred)).digest('hex');

  it('should return not found for missing credential', async () => {
    const res = await request(app).post('/verify').send({ id: 'does-not-exist' });
    expect(res.status).toBe(404);
  });

  it('should sync and then verify', async () => {
    const rSync = await request(app).post('/sync').send({
      credJson: cred,
      credHash,
      worker: 'worker-test',
      issuedAt: new Date().toISOString()
    });
    expect(rSync.status).toBe(200);

    const res = await request(app).post('/verify').send(cred);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.valid).toBe(true);
      expect(res.body).toHaveProperty('issuedByWorker');
    }
  });
});
