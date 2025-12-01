import { NavLink } from 'react-router-dom';
import { paths } from '../routes/paths';

const links = [
  { label: 'Início', to: paths.dashboard },
  { label: 'Contratos - Consulta', to: paths.contratos.consulta },
  { label: 'Contratos - Análise (Novo)', to: paths.contratos.analiseNovo },
  { label: 'Contratos - Análise (Aditivo)', to: paths.contratos.analiseAditivo },
  { label: 'Contratos - Distrato', to: paths.contratos.distrato },
  { label: 'Contratos - Equalização', to: paths.contratos.equalizacao },
  { label: 'Suprimentos - Novo Pedido', to: paths.suprimentos.novoPedido },
  { label: 'Suprimentos - Consulta Insumos', to: paths.suprimentos.consultaInsumos },
  { label: 'Suprimentos - Dados', to: paths.suprimentos.dados },
  { label: 'Obras', to: paths.suprimentos.obras },
  { label: 'Histórico', to: paths.historico }
];

function Sidebar() {
  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col p-4 space-y-4">
      <div className="text-2xl font-semibold">UAU Analyzer</div>
      <nav className="space-y-2 text-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-slate-800 ${isActive ? 'bg-slate-800' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
