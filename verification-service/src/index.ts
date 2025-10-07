import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { Database } from './db';

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
const db = new Database();

function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return JSON.stringify(obj.map(canonicalize));
  const keys = Object.keys(obj).sort();
  const out: any = {};
  for (const k of keys) out[k] = obj[k];
  return JSON.stringify(out);
}

function hashCredential(obj: any): string {
  const str = canonicalize(obj);
  return crypto.createHash('sha256').update(str).digest('hex');
}

app.get('/health', (req, res) => {
  res.json({
    service: 'verification',
    worker: process.env.HOSTNAME || 'worker-local',
    uptime: process.uptime()
  });
});

app.post('/verify', (req, res) => {
  const credential = req.body;
  if (!credential || Object.keys(credential).length === 0) {
    return res.status(400).json({ error: 'Empty credential' });
  }
  const credHash = hashCredential(credential);
  const record = db.getCredential(credHash);
  if (!record) {
    return res.status(404).json({ valid: false, message: 'credential not found' });
  }
  const verifier = process.env.HOSTNAME || 'worker-local';
  return res.status(200).json({
    valid: true,
    credentialHash: credHash,
    issuedByWorker: record.worker,
    issuedAt: record.issued_at,
    verifiedBy: verifier,
    verifiedAt: new Date().toISOString()
  });
});

app.post('/sync', (req, res) => {
  const { credJson, credHash, worker, issuedAt } = req.body;
  if (!credHash || !credJson) return res.status(400).json({ error: 'missing fields' });
  db.insertCredential(credHash, JSON.stringify(credJson), worker || 'unknown', issuedAt || new Date().toISOString());
  return res.status(200).json({ message: 'synced' });
});

app.get('/_all', (req, res) => {
  const records = db.all();
  res.json(records);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Verification service listening on ${PORT}`);
  });
}

export default app;
