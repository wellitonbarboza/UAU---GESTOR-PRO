import clsx from 'clsx';

interface Props {
  status: 'ok' | 'pendente' | 'alerta';
  label?: string;
}

function StatusPill({ status, label }: Props) {
  const colors = {
    ok: 'bg-emerald-100 text-emerald-700',
    pendente: 'bg-amber-100 text-amber-700',
    alerta: 'bg-rose-100 text-rose-700'
  } as const;
  return (
    <span className={clsx('px-2 py-1 rounded-full text-xs font-semibold', colors[status])}>
      {label || status}
    </span>
  );
}

export default StatusPill;
