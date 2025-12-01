import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  actions?: ReactNode;
}

function FilterBar({ children, actions }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
      <div className="flex gap-3 items-center flex-wrap">{children}</div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export default FilterBar;
