interface Props {
  selectedObra?: string;
  period: string;
  onPeriodChange: (value: string) => void;
  onExport: () => void;
  showExport?: boolean;
}

function Topbar({ selectedObra, period, onPeriodChange, onExport, showExport }: Props) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-500">Obra selecionada</div>
        <div className="font-semibold text-slate-800">{selectedObra || 'Nenhuma'}</div>
        <label className="text-sm text-slate-500 ml-4">Período</label>
        <input
          type="month"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        {showExport && (
          <button
            onClick={onExport}
            className="px-3 py-2 bg-primary text-white rounded shadow hover:brightness-95 text-sm"
          >
            Exportar
          </button>
        )}
        <div className="text-sm text-slate-600">Usuário</div>
      </div>
    </header>
  );
}

export default Topbar;
