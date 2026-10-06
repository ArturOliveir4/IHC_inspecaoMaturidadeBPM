import React, { createContext, useState, useEffect } from 'react';
import { MOCK_PROFILES } from '../mocks/mockData';
import api from '../services/api'; // <-- Adicione esta linha

export const AuthContext = createContext({});

const usuariosMock = {
  'admin@uepb.edu.br': {
    ...MOCK_PROFILES.admin,
    senha: 'admin123',
  },
  'gestor@uepb.edu.br': {
    ...MOCK_PROFILES.gestor,
    senha: 'gestor123',
  },
  'avaliador@uepb.edu.br': {
    ...MOCK_PROFILES.avaliador,
    senha: 'avaliador123',
  },
  'analista@uepb.edu.br': {
    ...MOCK_PROFILES.analista,
    senha: 'analista123',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@MaturidadeBPM:token');
    const storagedUser = localStorage.getItem('@MaturidadeBPM:user');

    if (storagedToken && storagedUser) {
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      // Faz a chamada real para o AuthController do seu Spring Boot
      const response = await api.post('/auth/login', { email, senha });
      
      // O back-end deve retornar o JWT gerado e os dados do usuário (ajuste as propriedades se o seu LoginResponseDTO for diferente)
      const { token, ...dadosUsuario } = response.data; 

      // Salva o token real criptografado no Local Storage
      localStorage.setItem('@MaturidadeBPM:token', token);
      
      // Salva os dados do usuário para exibir no painel
      localStorage.setItem('@MaturidadeBPM:user', JSON.stringify(dadosUsuario));
      setUser(dadosUsuario);
      
      return { success: true };
    } catch (error) {
      console.error("Erro no login:", error);
      return { 
        success: false, 
        message: 'E-mail ou senha inválidos no servidor real.' 
      };
    }
  };


  const cadastrar = async (email, senha, perfil) => {
    try {
      const response = await api.post('/auth/cadastro', { email, senha, perfil });
      return {
        success: true,
        message: response.data?.message || 'Usuário cadastrado com sucesso.',
      };
    } catch (error) {
      const message = error.response?.data?.error
        || error.response?.data?.message
        || 'Não foi possível concluir o cadastro.';

      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('@MaturidadeBPM:token');
    localStorage.removeItem('@MaturidadeBPM:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
