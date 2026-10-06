import React, { useContext, useState, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { AppLayout } from './components/AppLayout';
import { planoGovernancaService } from './services/planoGovernancaService'; 

import { Login } from './pages/Login';
import { Resultados } from './pages/Gestor/Resultados';
import { DashboardGerencial } from './pages/Gestor/DashboardGerencial';
import { Diagnostico } from './pages/Diagnostico';
import { FichaAsIs } from './pages/AsIs/FichaAsIs';
import { FichaToBe } from './pages/ToBe/FichaToBe';
import { ComparativoKPIs } from './pages/Gestor/ComparativoKPIs'; // <-- NOVA IMPORTA
import { AlertasAcompanhamento } from './pages/Gestor/AlertasAcompanhamento'; // <-- US16
import { CalendarioAtividades } from './pages/Calendario/CalendarioAtividades';
import { PlanoGovernanca } from './pages/Gestor/PlanoGovernanca';
import { ConfiguracaoGovernanca } from './pages/Gestor/ConfiguracaoGovernanca';

// <-- US21 (Gatilho Novo Ciclo)
import { AcionarGatilho } from './pages/Gestor/AcionarGatilho'; 

const roleLabels = {
  ROLE_ADMIN: 'Administrador',
  ROLE_GESTOR: 'Gestor',
  ROLE_AVALIADOR: 'Avaliador',
  ROLE_ANALISTA: 'Analista BPM',
};

const ProtectedPage = ({ children }) => (
  <PrivateRoute>
    <AppLayout>{children}</AppLayout>
  </PrivateRoute>
);

const AcessoNegado = () => (
  <div className="login-panel" style={{ minHeight: '100vh' }}>
    <div className="login-card">
      <span className="badge badge-danger">403</span>
      <h1 className="login-title" style={{ marginTop: 16 }}>Acesso negado</h1>
      <p className="login-subtitle">Você não tem permissão para acessar este recurso.</p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 18 }}>
        Voltar ao painel
      </Link>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const perfil = user?.perfil;
  const isGestor = perfil === 'ROLE_GESTOR' || perfil === 'ROLE_ADMIN';
  const isAdmin = perfil === 'ROLE_ADMIN';
  const isAnalista = perfil === 'ROLE_ANALISTA' || perfil === 'ROLE_ADMIN';

  // 👇 NOVO: Estados para guardar os dados reais
  const [totalPlanos, setTotalPlanos] = useState(0);

  // 👇 NOVO: Busca os dados reais do backend ao carregar a página
  useEffect(() => {
    const carregarEstatisticasReais = async () => {
      try {
        // Exemplo: contando os planos de governança vigentes reais do banco
        const planos = await planoGovernancaService.listarVigentes();
        setTotalPlanos(planos.length);
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      }
    };
    carregarEstatisticasReais();
  }, []);

  const cards = [
    {
      title: 'Responder diagnóstico',
      description: 'Questionário já preparado com fluxo visual de avaliação por princípios BPM.',
      to: '/diagnostico',
      action: 'Abrir questionário',
      visible: true,
      tone: 'primary',
    },
    {
      title: 'Ficha AS-IS',
      description: 'Processo, KPIs e diagrama BPMN já carregados para apresentação.',
      to: '/as-is',
      action: 'Gerenciar AS-IS',
      visible: isGestor || isAnalista,
      tone: 'secondary',
    },
    {
      title: 'Ficha TO-BE',
      description: 'Cadastrar metas operacionais esperadas (cenário futuro).',
      to: '/to-be',
      action: 'Gerenciar TO-BE',
      visible: isGestor || isAnalista,
      tone: 'secondary',
    },
    {
      title: 'Comparativo de KPIs',
      description: 'Visão consolidada AS-IS vs TO-BE com delta percentual.',
      to: '/gestor/comparativo-kpis',
      action: 'Acessar Comparativo',
      visible: isGestor || isAnalista,
      tone: 'secondary',
    },
    {
      title: 'Preparar Governança',
      description: 'Priorize processos do Módulo 1 e cadastre instrumentos de monitoramento do Módulo 3.',
      to: '/gestor/configuracao-governanca',
      action: 'Preparar dados',
      visible: isGestor,
      tone: 'secondary',
    },
    {
      title: 'Plano de Governança',
      description: 'Cadastre a matriz de responsabilidades, monitoramento, revisões e gatilhos por processo.',
      to: '/gestor/plano-governanca',
      action: 'Gerenciar governança',
      visible: isGestor,
      tone: 'secondary',
    },
    {
      title: 'Alertas de Acompanhamento',
      description: 'Configure lembretes periódicos de revisão por processo (US16).',
      to: '/gestor/alertas',
      action: 'Configurar alertas',
      visible: isGestor,
      tone: 'secondary',
    },
    {
      title: 'Calendário de Atividades',
      description: 'Acompanhe prazos, revisões pendentes e mantenha a agenda de governança em dia.',
      to: '/calendario',
      action: 'Ver calendário',
      visible: true,
      tone: 'secondary',
    },
  ].filter((card) => card.visible);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Painel principal</div>
          <h1 className="page-title">Olá, {user?.nome || user?.email?.split('@')[0] || 'usuário'}.</h1>
          <p className="page-description">
            Plataforma de governança e maturidade BPM.
          </p>
        </div>
        <span className="badge badge-primary">{roleLabels[perfil] || perfil}</span>
      </header>

      {/* 👇 DADO REAL EXIBIDO AQUI */}
      <section className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card stat-card">
          <div className="stat-label">Planos de Governança Ativos</div>
          <div className="stat-value">{totalPlanos}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Ambiente</div>
          <div className="stat-value" style={{ fontSize: 22 }}>Produção / Real</div>
        </div>
      </section>

      <section className="grid grid-2">
        {cards.map((card) => (
          <article className="card card-pad" key={card.to}>
            <h2 className="card-title">{card.title}</h2>
            <p className="card-description">{card.description}</p>
            <Link to={card.to} className={`btn ${card.tone === 'primary' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginTop: 18 }}>
              {card.action} →
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
          <Route path="/gestor/dashboard" element={<ProtectedPage><DashboardGerencial /></ProtectedPage>} />
          <Route path="/diagnostico" element={<ProtectedPage><Diagnostico /></ProtectedPage>} />
          <Route path="/as-is" element={<ProtectedPage><FichaAsIs /></ProtectedPage>} />
          <Route path="/to-be" element={<ProtectedPage><FichaToBe /></ProtectedPage>} />
          
          {/* <-- NOVA ROTA AQUI */}
          <Route path="/gestor/comparativo-kpis" element={<ProtectedPage><ComparativoKPIs /></ProtectedPage>} />
          
          {/* US16   Alertas de Acompanhamento */}
          <Route path="/gestor/alertas" element={<ProtectedPage><AlertasAcompanhamento /></ProtectedPage>} />
          <Route path="/gestor/configuracao-governanca" element={<ProtectedPage><ConfiguracaoGovernanca /></ProtectedPage>} />
          <Route path="/gestor/plano-governanca" element={<ProtectedPage><PlanoGovernanca /></ProtectedPage>} />
          
          {/* US21   Acionar Novo Ciclo (Gatilho) */}
          <Route path="/gestor/processos/:id/acionar-gatilho" element={<ProtectedPage><AcionarGatilho /></ProtectedPage>} />

          <Route path="/calendario" element={<ProtectedPage><CalendarioAtividades /></ProtectedPage>} />
          <Route path="/unauthorized" element={<AcessoNegado />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/gestor/resultados/:id" element={<Resultados />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;