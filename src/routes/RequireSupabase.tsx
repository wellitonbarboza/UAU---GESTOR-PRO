// src/routes/RequireSupabase.tsx
import React from 'react';
import { isSupabaseEnabled } from '../lib/supabaseClient';

export default function RequireSupabase({ children }: { children: React.ReactNode }) {
  if (!isSupabaseEnabled) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h2>Supabase não configurado</h2>
        <p>Defina no Netlify e publique novamente:</p>
        <ul>
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          O app continua rodando localmente, mas o login e a persistência ficarão inoperantes até o novo
          deploy.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
