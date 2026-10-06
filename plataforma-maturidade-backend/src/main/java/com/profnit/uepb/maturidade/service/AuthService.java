package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.AuditoriaLog;
import com.profnit.uepb.maturidade.domain.Usuario;
import com.profnit.uepb.maturidade.repository.AuditoriaLogRepository;
import com.profnit.uepb.maturidade.repository.UsuarioRepository;
import com.profnit.uepb.maturidade.security.JwtService;
import com.profnit.uepb.maturidade.web.dto.CadastroUsuarioRequestDTO;
import com.profnit.uepb.maturidade.web.dto.LoginRequestDTO;
import com.profnit.uepb.maturidade.web.dto.LoginResponseDTO;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Locale;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AuditoriaLogRepository auditoriaLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                        AuditoriaLogRepository auditoriaLogRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponseDTO autenticar(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    auditoriaLogRepository.save(new AuditoriaLog(request.getEmail(), "Tentativa de login malsucedida: Usuário não cadastrado."));
                    return new BadCredentialsException("E-mail ou senha incorretos.");
                });

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            auditoriaLogRepository.save(new AuditoriaLog(usuario.getEmail(), "Tentativa de login malsucedida: Senha incorreta."));
            throw new BadCredentialsException("E-mail ou senha incorretos.");
        }

        auditoriaLogRepository.save(new AuditoriaLog(usuario.getEmail(), "Login efetuado com sucesso na plataforma."));

        // Extrai a String correspondente ao Enum para a geração do token e resposta
        String token = jwtService.gerarToken(usuario.getEmail(), usuario.getPerfil().name());

        return new LoginResponseDTO(token, usuario.getEmail(), usuario.getPerfil().name());
    }

    @Transactional
    public void cadastrarUsuario(CadastroUsuarioRequestDTO request) {
        String email = request.getEmail() == null
                ? ""
                : request.getEmail().trim().toLowerCase(Locale.ROOT);
        String senha = request.getSenha() == null ? "" : request.getSenha();
        String perfilInformado = request.getPerfil() == null
                ? ""
                : request.getPerfil().trim().toUpperCase(Locale.ROOT);

        if (email.isBlank() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um e-mail válido.");
        }

        if (senha.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve possuir pelo menos 6 caracteres.");
        }

        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario.Perfil perfil;
        try {
            perfil = Usuario.Perfil.valueOf(perfilInformado);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Perfil inválido. Escolha Gestor, Administrador, Avaliador ou Analista."
            );
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setEmail(email);
        novoUsuario.setSenha(passwordEncoder.encode(senha));
        novoUsuario.setPerfil(perfil);
        novoUsuario.setAtivo(true);

        usuarioRepository.save(novoUsuario);
        auditoriaLogRepository.save(new AuditoriaLog(email, "Novo usuário cadastrado pela tela inicial com o perfil " + perfil.name() + "."));
    }
}