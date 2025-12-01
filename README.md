# UAU Analyzer

Aplicação web (Vite + React + TypeScript) para importar planilhas do sistema UAU, gerar base RAW e CANÔNICA no Supabase e oferecer análises de Contratos e Suprimentos com exportação e histórico.

## Requisitos
- Node.js 18+
- Supabase project com RLS habilitado

## Instalação
```
npm ci
npm run dev
```
A aplicação roda em `http://localhost:5173`.

## Variáveis de ambiente
Crie um `.env` baseado em `.env.example`:
```
VITE_SUPABASE_URL=<url do supabase>
VITE_SUPABASE_ANON_KEY=<anon key>
```

## Supabase
1. Rode a migration SQL:
```
supabase db push --file supabase/migrations/0001_init.sql
```
2. Garanta que a função `current_company_id()` retorne o `company_id` do usuário logado (por exemplo, via JWT claim) para que as políticas RLS funcionem.

## Deploy na Netlify
- Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel.
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- SPA redirect já configurado em `netlify.toml`.

## Como fica o bundle de produção
O build Vite gera arquivos com hash (por exemplo, `index-BC-G83pj.js`) que são carregados via `modulepreload` para agilizar o download dos módulos. Esse bundle já inclui a versão de produção do React (`react.production.min.js`) e do runtime JSX, além do código da aplicação. A sequência típica no HTML é:

1. `<link rel="modulepreload">` para antecipar o fetch dos chunks principais.
2. Scripts de entrada que importam o React e inicializam o app.

Em produção na Netlify, a página inicial (`index.html`) referencia os assets hashed em `dist/`, então qualquer nova build publicará um novo hash e o CDN cuidará do cache busting. Caso precise depurar o bundle, rode `npm run build` localmente e verifique os arquivos em `dist` com um servidor estático (`npm run preview`).

## Estrutura principal
- `src/layout`: AppShell com sidebar/topbar
- `src/pages`: rotas para Dashboard, Suprimentos (upload, obras, pedidos, consulta), Contratos (consulta, análises, distrato, equalização), Histórico e Auth.
- `src/lib/uau`: mapeamento de abas, importação XLSX, normalização/canônico, engines de cálculo e persistência Supabase.
- `src/lib/export`: utilitários para PNG/PDF/XLSX.

## Critérios atendidos
- Upload de XLSX com validação de abas obrigatórias e prévia de linhas.
- Geração de base canônica e listagem de processos sem contrato.
- Consulta de contratos com % medido e saldo.
- Simulação de novo contrato e exportação de relatório (PNG/PDF/XLSX).
- Configuração pronta para Netlify + Supabase.
