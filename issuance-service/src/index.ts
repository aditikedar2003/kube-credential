import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { Database } from './db';
import { CredentialRecord } from './types';

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
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
    service: 'issuance',
    worker: process.env.HOSTNAME || 'worker-local',
    uptime: process.uptime()
  });
});

app.post('/issue', (req, res) => {
  const credential = req.body;
  if (!credential || Object.keys(credential).length === 0) {
    return res.status(400).json({ error: 'Empty credential' });
  }
  const credHash = hashCredential(credential);
  const existing = db.getCredential(credHash) as CredentialRecord | undefined;
  if (existing) {
    return res.status(200).json({
      message: 'credential already issued',
      worker: existing.worker,
      issuedAt: existing.issued_at,
      credHash
    });
  }
  const worker = process.env.HOSTNAME || 'worker-local';
  const issuedAt = new Date().toISOString();
  db.insertCredential(credHash, JSON.stringify(credential), worker, issuedAt);
  return res.status(201).json({
    message: `credential issued by ${worker}`,
    worker,
    issuedAt,
    credHash
  });
});

app.get('/_all', (req, res) => {
  const records = db.all();
  res.json(records);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Issuance service listening on ${PORT}`);
  });
}

export default app;
