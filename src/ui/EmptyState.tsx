interface Props {
  title: string;
  description?: string;
}

function EmptyState({ title, description }: Props) {
  return (
    <div className="text-center py-8 text-slate-500">
      <div className="text-lg font-semibold text-slate-700">{title}</div>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export default EmptyState;
