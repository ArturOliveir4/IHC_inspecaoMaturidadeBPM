import React, { useState } from 'react';
import { MOCK_USUARIOS_LISTA } from '../../mocks/mockData';

const perfilLabel = {
  ROLE_ADMIN: 'Administrador',
  ROLE_GESTOR: 'Gestor',
  ROLE_AVALIADOR: 'Avaliador',
  ROLE_ANALISTA: 'Analista BPM',
};

const usuariosDemo = MOCK_USUARIOS_LISTA.map((usuario, index) => ({
  ...usuario,
  ultimoAcesso: index < 2 ? 'Hoje' : 'Ontem',
  status: usuario.status === 'Pendente' ? 'Ativo' : usuario.status,
}));

export const GerenciarUsuarios = () => {
  const [usuarios] = useState(usuariosDemo);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Administração</div>
          <h1 className="page-title">Usuários e perfis</h1>
          <p className="page-description">
            Lista demonstrativa já preenchida com os perfis usados no protótipo da plataforma.
          </p>
        </div>
        <span className="badge badge-primary">4 perfis configurados</span>
      </header>

      <section className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="card stat-card">
          <div className="stat-label">Usuários</div>
          <div className="stat-value">{usuarios.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Ativos</div>
          <div className="stat-value">{usuarios.filter((user) => user.status === 'Ativo').length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Perfis</div>
          <div className="stat-value">4</div>
        </div>
      </section>

      <section className="card card-pad">
        <h2 className="card-title">Lista de usuários</h2>
        <p className="card-description">Usuários demonstrativos para testar navegação por perfil.</p>

        <div className="table-wrap" style={{ marginTop: 18 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.email}>
                  <td><strong>{usuario.nome}</strong></td>
                  <td>{usuario.email}</td>
                  <td>{perfilLabel[usuario.perfil] || usuario.perfil}</td>
                  <td><span className="badge badge-success">{usuario.status}</span></td>
                  <td>{usuario.ultimoAcesso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
