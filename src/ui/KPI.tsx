interface Props {
  label: string;
  value: string | number;
  helper?: string;
}

function KPI({ label, value, helper }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      {helper && <div className="text-xs text-slate-500 mt-1">{helper}</div>}
    </div>
  );
}

export default KPI;
