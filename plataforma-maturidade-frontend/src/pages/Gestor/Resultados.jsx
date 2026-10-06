import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Sua configuração do Axios com o Token
import { RadarMaturidade } from '../../components/RadarMaturidade';

export const Resultados = () => {
  const { id } = useParams(); // Pega o ID da avaliação na URL
  const navigate = useNavigate();
  
  const [dadosRadar, setDadosRadar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarResultadosReais = async () => {
      try {
        setLoading(true);
        // Faz a chamada para o back-end buscar o cálculo do Motor Matemático
        const response = await api.get(`/diagnosticos/${id}`);
        
        // A propriedade exata depende de como a sua equipe nomeou no DTO (ex: response.data.percentuais ou response.data.resultadoMaturidade)
        setDadosRadar(response.data.resultadosPorPrincipio); 
      } catch (error) {
        console.error('Erro ao buscar o cálculo do back-end:', error);
        setErro('Não foi possível carregar o gráfico. Verifique o console.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarResultadosReais();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="card card-pad" style={{ textAlign: 'center', marginTop: 40 }}>
          <h2>Processando Motor Matemático...</h2>
          <p>Calculando a normalização das suas respostas.</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="page">
        <div className="alert alert-danger">{erro}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Resultados do Diagnóstico</div>
          <h1 className="page-title">Maturidade AS-IS Consolidada</h1>
          <p className="page-description">Análise baseada nas respostas reais salvas no PostgreSQL.</p>
        </div>
      </header>

      <section className="card card-pad" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Gráfico Radar</h2>
        
        {/* Passa o objeto real que veio da API direto para o seu componente dinâmico */}
        <RadarMaturidade dadosPrincipios={dadosRadar} />
        
      </section>

      <div className="actions-row">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Voltar ao Painel
        </button>
      </div>
    </div>
  );
};