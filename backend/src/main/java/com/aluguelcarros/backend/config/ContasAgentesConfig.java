package com.aluguelcarros.backend.config;

import com.aluguelcarros.backend.model.PerfilUsuario;
import com.aluguelcarros.backend.model.Usuario;
import com.aluguelcarros.backend.repository.UsuarioRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("criar-agentes")
public class ContasAgentesConfig {
    @Bean
    ApplicationRunner criarAgentes(Environment env, UsuarioRepository usuarios, PasswordEncoder encoder) {
        return args -> {
            criar(env, usuarios, encoder, PerfilUsuario.EMPRESA);
            criar(env, usuarios, encoder, PerfilUsuario.BANCO);
        };
    }

    private void criar(Environment env, UsuarioRepository usuarios, PasswordEncoder encoder, PerfilUsuario perfil) {
        String login = env.getProperty("AGENTE_" + perfil + "_LOGIN", "").strip();
        String senha = env.getProperty("AGENTE_" + perfil + "_SENHA", "");
        if (login.isEmpty() && senha.isEmpty()) return;
        if (login.isEmpty() || login.contains(":") || senha.isBlank()) {
            throw new IllegalArgumentException("Informe login válido e senha para " + perfil);
        }
        var existente = usuarios.findByLogin(login);
        if (existente.isPresent()) {
            if (existente.get().getPerfil() != perfil) {
                throw new IllegalArgumentException("Login já utilizado por outro perfil");
            }
            return;
        }
        usuarios.save(new Usuario(login, encoder.encode(senha), perfil));
    }
}
