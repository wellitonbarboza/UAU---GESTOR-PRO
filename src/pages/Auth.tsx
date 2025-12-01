import Card from '../ui/Card';
import { isSupabaseEnabled } from '../lib/supabaseClient';

function Auth() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <Card title="Login" description="Autenticação via Supabase">
        {isSupabaseEnabled ? (
          <div className="text-sm text-slate-600">Implemente o fluxo de login com Supabase Auth.</div>
        ) : (
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Supabase desabilitado.</p>
            <p>
              Para ativar login e persistência, configure as variáveis <strong>VITE_SUPABASE_URL</strong> e
              <strong> VITE_SUPABASE_ANON_KEY</strong> no painel do Netlify e faça um novo deploy.
            </p>
            <p className="text-slate-600">
              Até lá, o app continua acessível, mas recursos que dependem do Supabase ficarão indisponíveis.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Auth;
