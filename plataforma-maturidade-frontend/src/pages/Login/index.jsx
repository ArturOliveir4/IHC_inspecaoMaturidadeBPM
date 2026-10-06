import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Login = () => {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState('ROLE_AVALIADOR');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('danger');
  const [submitting, setSubmitting] = useState(false);

  const { login, cadastrar } = useContext(AuthContext);
  const navigate = useNavigate();

  const limparMensagem = () => setMensagem('');

  const alternarModo = (novoModo) => {
    setModo(novoModo);
    limparMensagem();
    setConfirmarSenha('');
    setPerfil('ROLE_AVALIADOR');

    if (novoModo === 'cadastro') {
      setEmail('');
      setSenha('');
    }
  };

  const handleLogin = async () => {
    const result = await login(email.trim(), senha);
    if (result?.success) {
      navigate('/dashboard');
      return;
    }

    setTipoMensagem('danger');
    setMensagem(result?.message || 'Credenciais inválidas.');
  };

  const handleCadastro = async () => {
    if (senha.length < 6) {
      setTipoMensagem('danger');
      setMensagem('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setTipoMensagem('danger');
      setMensagem('As senhas informadas não coincidem.');
      return;
    }

    const result = await cadastrar(email.trim(), senha, perfil);
    if (!result?.success) {
      setTipoMensagem('danger');
      setMensagem(result?.message || 'Não foi possível concluir o cadastro.');
      return;
    }

    setModo('login');
    setConfirmarSenha('');
    setTipoMensagem('success');
    setMensagem('Cadastro concluído. Agora entre com seu e-mail e senha.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    limparMensagem();

    if (!email.trim() || !senha) {
      setTipoMensagem('danger');
      setMensagem('Preencha e-mail e senha para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      if (modo === 'cadastro') {
        await handleCadastro();
      } else {
        await handleLogin();
      }
    } catch (error) {
      setTipoMensagem('danger');
      setMensagem(`Erro ao processar a solicitação: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const emCadastro = modo === 'cadastro';

  return (
    <div className="login-page">
      <section className="login-hero">
        <div>
          <div className="brand-mark login-brand-mark">BPM</div>
        </div>

        <div>
          <span className="badge login-hero-badge">CRPA / PROGRAD</span>
          <h1>Avaliação de maturidade BPM simples, visual e objetiva.</h1>
          <p>
            Acompanhe diagnósticos, indicadores AS-IS e TO-BE, planos de governança
            e resultados de maturidade em um único ambiente.
          </p>
        </div>

        <div className="actions-row">
          <span className="badge login-hero-badge">Ambiente de demonstração</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-mode-switch" role="tablist" aria-label="Acesso à plataforma">
            <button
              type="button"
              role="tab"
              aria-selected={!emCadastro}
              className={!emCadastro ? 'active' : ''}
              onClick={() => alternarModo('login')}
              disabled={submitting}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={emCadastro}
              className={emCadastro ? 'active' : ''}
              onClick={() => alternarModo('cadastro')}
              disabled={submitting}
            >
              Criar conta
            </button>
          </div>

          <div className="eyebrow">Acesso à plataforma</div>
          <h2 className="login-title">{emCadastro ? 'Cadastre-se' : 'Entrar'}</h2>
          <p className="login-subtitle">
            {emCadastro
              ? 'Crie sua conta e escolha o perfil de acesso à plataforma.'
              : 'Informe suas credenciais para continuar.'}
          </p>

          {mensagem && (
            <div className={`alert alert-${tipoMensagem} login-feedback`} role="alert">
              {mensagem}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email" className="label">E-mail institucional</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="exemplo@uepb.edu.br"
                autoComplete="email"
                disabled={submitting}
                required
              />
            </div>

            <div className="field login-field-spacing">
              <label htmlFor="senha" className="label">Senha</label>
              <input
                id="senha"
                type="password"
                className="input"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder={emCadastro ? 'Mínimo de 6 caracteres' : 'Digite sua senha'}
                autoComplete={emCadastro ? 'new-password' : 'current-password'}
                minLength={emCadastro ? 6 : undefined}
                disabled={submitting}
                required
              />
            </div>

            {emCadastro && (
              <div className="field login-field-spacing">
                <label htmlFor="perfil" className="label">Tipo de conta</label>
                <select
                  id="perfil"
                  className="input"
                  value={perfil}
                  onChange={(event) => setPerfil(event.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="ROLE_GESTOR">Gestor</option>
                  <option value="ROLE_ADMIN">Administrador</option>
                  <option value="ROLE_AVALIADOR">Avaliador</option>
                  <option value="ROLE_ANALISTA">Analista</option>
                </select>
              </div>
            )}

            {emCadastro && (
              <div className="field login-field-spacing">
                <label htmlFor="confirmarSenha" className="label">Confirmar senha</label>
                <input
                  id="confirmarSenha"
                  type="password"
                  className="input"
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  minLength={6}
                  disabled={submitting}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              {submitting
                ? (emCadastro ? 'Cadastrando...' : 'Autenticando...')
                : (emCadastro ? 'Criar minha conta' : 'Entrar na plataforma')}
            </button>
          </form>

        </div>
      </section>
    </div>
  );
};
