import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { paths } from '../routes/paths';

type Section =
  | { key: string; label: string; to: string; children?: never }
  | { key: string; label: string; children: { label: string; to: string }[]; to?: never };

const sections: Section[] = [
  { key: 'inicio', label: 'Início', to: paths.dashboard },
  {
    key: 'contratos',
    label: 'Contratos',
    children: [
      { label: 'Analisar contrato novo', to: paths.contratos.analiseNovo },
      { label: 'Analisar aditivo', to: paths.contratos.analiseAditivo },
      { label: 'Distrato', to: paths.contratos.distrato },
      { label: 'Equalização', to: paths.contratos.equalizacao },
      { label: 'Consultar contratos', to: paths.contratos.consulta }
    ]
  },
  {
    key: 'suprimentos',
    label: 'Suprimentos',
    children: [
      { label: 'Novo pedido', to: paths.suprimentos.novoPedido },
      { label: 'Consulta insumos', to: paths.suprimentos.consultaInsumos },
      { label: 'Dados', to: paths.suprimentos.dados }
    ]
  },
  { key: 'obras', label: 'Obras', to: paths.suprimentos.obras },
  { key: 'historico', label: 'Histórico', to: paths.historico }
];

function Sidebar() {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const activeSection = sections.find((section) => {
      if ('children' in section) {
        return section.children.some((item) => location.pathname.startsWith(item.to));
      }
      return section.to === location.pathname;
    });

    setOpenSection(activeSection && 'children' in activeSection ? activeSection.key : null);
  }, [location.pathname]);

  const toggleSection = (sectionKey: string) => {
    setOpenSection((current) => (current === sectionKey ? null : sectionKey));
  };

  const isChildActive = (to: string) => location.pathname.startsWith(to);

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col p-4 space-y-4">
      <div className="text-2xl font-semibold">UAU Analyzer</div>
      <nav className="space-y-2 text-sm">
        {sections.map((section) => {
          if ('children' in section) {
            const expanded = openSection === section.key;
            const hasActiveChild = section.children.some((child) => isChildActive(child.to));

            return (
              <div key={section.key} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded hover:bg-slate-800 ${
                    expanded || hasActiveChild ? 'bg-slate-800' : ''
                  }`}
                >
                  <span>{section.label}</span>
                  <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>&#9654;</span>
                </button>
                <div
                  className={`space-y-1 pl-4 transition-[max-height] duration-200 ease-in-out overflow-hidden ${
                    expanded || hasActiveChild ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  {section.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded hover:bg-slate-800 ${
                          isActive ? 'bg-slate-800' : 'bg-slate-900'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={section.to}
              to={section.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded hover:bg-slate-800 ${isActive ? 'bg-slate-800' : ''}`
              }
            >
              {section.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
