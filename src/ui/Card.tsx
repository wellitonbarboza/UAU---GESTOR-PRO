import { ReactNode } from 'react';

interface Props {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, actions, children }: Props) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      {(title || description || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;
