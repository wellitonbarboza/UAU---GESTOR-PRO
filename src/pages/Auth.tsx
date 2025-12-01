import Card from '../ui/Card';

function Auth() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <Card title="Login" description="Autenticação via Supabase">
        <div className="text-sm text-slate-600">Implemente o fluxo de login com Supabase Auth.</div>
      </Card>
    </div>
  );
}

export default Auth;
