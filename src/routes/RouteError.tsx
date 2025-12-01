import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

function formatUnknownError(error: unknown): { title: string; details: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: `Erro ${error.status}`,
      details: typeof error.data === 'string' ? error.data : JSON.stringify(error.data, null, 2)
    };
  }

  if (error instanceof Error) {
    return {
      title: error.name || 'Erro',
      details: error.stack || error.message || String(error)
    };
  }

  return { title: 'Erro', details: typeof error === 'string' ? error : JSON.stringify(error, null, 2) };
}

export default function RouteError() {
  const error = useRouteError();
  const { title, details } = formatUnknownError(error);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-slate-300 mt-1">
              O app caiu durante o carregamento. Abaixo está o erro bruto para corrigirmos na raiz.
            </p>
          </div>
          <button
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>

        <div className="mt-4">
          <div className="text-xs text-slate-400 mb-2">Detalhes</div>
          <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs leading-relaxed border border-slate-800">
            {details}
          </pre>
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Dica: se a mensagem citar Supabase/env, ajuste as variáveis no Netlify e redeploy.
        </div>
      </div>
    </div>
  );
}
