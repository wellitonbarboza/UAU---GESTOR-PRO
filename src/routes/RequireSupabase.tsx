// src/routes/RequireSupabase.tsx
import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function RequireSupabase({ children }: { children: React.ReactNode }) {
  if (!supabase) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2>Supabase não configurado</h2>
        <p>Defina no Netlify:</p>
        <ul>
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
      </div>
    );
  }
  return <>{children}</>;
}
