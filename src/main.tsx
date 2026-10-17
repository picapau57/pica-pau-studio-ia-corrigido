import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const KEY_STORAGE = 'picapau_access_key';

// Anexa a senha de acesso em todas as chamadas /api
const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
  if (url.startsWith('/api')) {
    const key = localStorage.getItem(KEY_STORAGE);
    if (key) {
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      headers.set('x-access-key', key);
      return originalFetch(input, { ...init, headers });
    }
  }
  return originalFetch(input, init);
};

type GateState = 'checking' | 'locked' | 'ok';

function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('checking');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/access/check');
      if (res.ok) return setState('ok');
      const data = await res.json().catch(() => ({}));
      setError(data.misconfigured ? data.error : '');
      setState('locked');
    } catch {
      setError('Não foi possível conectar ao servidor.');
      setState('locked');
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(KEY_STORAGE, password);
    setError('');
    const res = await fetch('/api/access/check');
    if (res.ok) return setState('ok');
    localStorage.removeItem(KEY_STORAGE);
    setError('Senha incorreta.');
  };

  if (state === 'ok') return <>{children}</>;
  if (state === 'checking') return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070c14', padding: 16 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24, color: '#e2e8f0' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#dc2626,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#020617', marginBottom: 16 }}>PP</div>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Pica-Pau Studio IA</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>Acesso restrito. Informe a senha para continuar.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha de acesso"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#020617', color: '#e2e8f0', fontSize: 14, marginBottom: 12 }}
        />
        {error && <p style={{ fontSize: 12, color: '#f87171', margin: '0 0 12px' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: 0, background: '#f59e0b', color: '#020617', fontWeight: 800, cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessGate>
      <App />
    </AccessGate>
  </React.StrictMode>
);
