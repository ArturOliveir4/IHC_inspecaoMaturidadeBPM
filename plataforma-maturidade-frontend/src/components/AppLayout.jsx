import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const roleLabels = {
  ROLE_ADMIN: 'Administrador',
  ROLE_GESTOR: 'Gestor',
  ROLE_AVALIADOR: 'Avaliador',
  ROLE_ANALISTA: 'Analista BPM',
};

const navItems = [
  { to: '/dashboard', label: 'Visão geral', icon: '⌂', roles: ['ROLE_ADMIN', 'ROLE_GESTOR', 'ROLE_AVALIADOR', 'ROLE_ANALISTA'] },
  { to: '/gestor/dashboard', label: 'Dashboard gerencial', icon: '◈', roles: ['ROLE_ADMIN', 'ROLE_GESTOR','ROLE_AVALIADOR'] },
  
  // Apenas Administrador e Avaliador podem responder diagnóstico (Gestor fica de fora)
  { to: '/diagnostico', label: 'Responder diagnóstico', icon: '◉', roles: ['ROLE_ADMIN', 'ROLE_AVALIADOR'] },
  
  // Módulos de Gestão e Governança (Admin e Gestor)
  { to: '/as-is', label: 'Ficha AS-IS', icon: '□', roles: ['ROLE_ADMIN', 'ROLE_GESTOR'] },
  { to: '/to-be', label: 'Ficha TO-BE', icon: '□', roles: ['ROLE_ADMIN', 'ROLE_GESTOR'] },
  { to: '/gestor/comparativo-kpis', label: 'Comparativo de KPIs', icon: '◈', roles: ['ROLE_ADMIN', 'ROLE_GESTOR'] },
  { to: '/gestor/configuracao-governanca', label: 'Preparar Governança', icon: '⚙', roles: ['ROLE_ADMIN', 'ROLE_GESTOR'] },
  { to: '/gestor/plano-governanca', label: 'Plano de governança', icon: '▤', roles: ['ROLE_ADMIN', 'ROLE_GESTOR'] },
  { to: '/gestor/alertas', label: 'Alertas de acompanhamento', icon: '▦', roles: ['ROLE_ADMIN', 'ROLE_GESTOR'] },
  
  
  // Calendário visível para todos os perfis
  { to: '/calendario', label: 'Calendário de atividades', icon: '▦', roles: ['ROLE_ADMIN', 'ROLE_GESTOR', 'ROLE_AVALIADOR'] },
];

export const AppLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const perfil = user?.perfil;
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(perfil));

  const confirmarSaidaComAlteracoes = () => {
    const planoSujo = sessionStorage.getItem('@MaturidadeBPM:plano-governanca:alteracoes-nao-salvas') === 'true';
    if (!planoSujo || location.pathname !== '/gestor/plano-governanca') return true;
    const confirmar = window.confirm('Existem alterações não salvas no Plano de Governança. Deseja sair e descartá-las?');
    if (confirmar) sessionStorage.removeItem('@MaturidadeBPM:plano-governanca:alteracoes-nao-salvas');
    return confirmar;
  };

  const handleLogout = () => {
    if (!confirmarSaidaComAlteracoes()) return;
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">BPM</div>
          <div>
            <div className="brand-title">Maturidade BPM</div>
            <div className="brand-subtitle">CRPA / PROGRAD</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={(event) => { if (item.to !== location.pathname && !confirmarSaidaComAlteracoes()) event.preventDefault(); }}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-email">{user?.email || 'Usuário autenticado'}</div>
          <div className="user-role">{roleLabels[perfil] || perfil || 'Perfil não identificado'}</div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout} style={{ width: '100%', marginTop: 12 }}>
            Sair da plataforma
          </button>
        </div>
      </aside>

      <main className="content-shell">{children}</main>
    </div>
  );
};
