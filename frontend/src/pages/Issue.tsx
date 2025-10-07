import React, { useState } from 'react';

export default function Issue() {
  const [input, setInput] = useState(`{ "id": "cred-1", "name": "Aditi K." }`);
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      const parsed = JSON.parse(input);
      const r = await fetch('/api/issuance/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await r.json();
      setResp({ status: r.status, data });
      // Sync to verification so verification DB has the record
      if ((r.status === 201 || r.status === 200) && data.credHash) {
        await fetch('/api/verification/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credJson: parsed,
            credHash: data.credHash,
            worker: data.worker || (data.message ? data.message.split('by ')[1] : 'unknown'),
            issuedAt: data.issuedAt || new Date().toISOString()
          })
        }).catch(() => {});
      }
    } catch (err: any) {
      setResp({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Issue Credential</h1>
      <form onSubmit={handleSubmit}>
        <textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}> {loading ? 'Issuing...' : 'Issue Credential'} </button>
        </div>
      </form>

      <div className="result">
        <strong>Response:</strong>
        <pre>{JSON.stringify(resp, null, 2)}</pre>
      </div>
    </div>
  );
}
