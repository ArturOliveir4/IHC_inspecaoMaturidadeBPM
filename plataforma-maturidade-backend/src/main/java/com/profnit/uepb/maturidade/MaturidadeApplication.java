package com.profnit.uepb.maturidade;

import com.profnit.uepb.maturidade.domain.Usuario;
import com.profnit.uepb.maturidade.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class MaturidadeApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaturidadeApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se o usuário já existe para não duplicar toda vez que reiniciar
            if (usuarioRepository.findByEmail("admin@uepb.edu.br").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setEmail("admin@uepb.edu.br");
                admin.setSenha(passwordEncoder.encode("admin123")); // Criptografa a senha nativamente
                admin.setPerfil(Usuario.Perfil.ROLE_ADMIN); // Usa o Enum existente na sua classe
                admin.setAtivo(true); // Opcional, pois já inicia como true na sua classe
                
                usuarioRepository.save(admin);
                System.out.println("✅ Usuário ADMIN criado no banco de dados com sucesso!");
            }
        };
    }
}