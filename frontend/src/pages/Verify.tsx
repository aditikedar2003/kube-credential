import React, { useState } from 'react';

export default function Verify() {
  const [input, setInput] = useState(`{ "id": "cred-1", "name": "Aditi K." }`);
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      const parsed = JSON.parse(input);
      const r = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await r.json();
      setResp({ status: r.status, data });
    } catch (err: any) {
      setResp({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Verify Credential</h1>
      <form onSubmit={handleSubmit}>
        <textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}> {loading ? 'Verifying...' : 'Verify Credential'} </button>
        </div>
      </form>

      <div className="result">
        <strong>Response:</strong>
        <pre>{JSON.stringify(resp, null, 2)}</pre>
      </div>
    </div>
  );
}
