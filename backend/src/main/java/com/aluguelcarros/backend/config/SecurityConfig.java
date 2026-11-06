
package com.aluguelcarros.backend.config;

import com.aluguelcarros.backend.service.UsuarioDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UsuarioDetailsService usuarioDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider(usuarioDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }


@Bean
public SecurityContextRepository securityContextRepository() {
    return new HttpSessionSecurityContextRepository();
}

@Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        AuthenticationProvider authenticationProvider,
        SecurityContextRepository securityContextRepository)
        throws Exception {

    http
        .securityContext(context -> context.securityContextRepository(securityContextRepository))
        .logout(logout -> logout.logoutUrl("/api/auth/sair")
            .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(org.springframework.http.HttpStatus.NO_CONTENT)))
        .authenticationProvider(authenticationProvider)
        .authorizeHttpRequests(auth -> auth

            .requestMatchers(
    org.springframework.http.HttpMethod.GET,
    "/api/auth/me"
).authenticated()

            .dispatcherTypeMatchers(
            jakarta.servlet.DispatcherType.ERROR
            ).permitAll()

            .requestMatchers(
                HttpMethod.OPTIONS, "/**"
            ).permitAll()

            .requestMatchers(
                HttpMethod.POST, "/api/auth/cadastro"
            ).permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/entrar").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()

            // CRUD antigo de clientes: bloqueado
            .requestMatchers("/api/clientes", "/api/clientes/**")
                .denyAll()

            // Cadastro e consulta do proprio cliente
            .requestMatchers("/api/meu-cliente", "/api/meu-cliente/**")
                .hasRole("CLIENTE")

            // Solicitacoes do proprio cliente
            .requestMatchers("/api/meus-alugueis", "/api/meus-alugueis/**")
                .hasRole("CLIENTE")

            // Cadastro e alteracao de automoveis
            .requestMatchers(
                HttpMethod.POST, "/api/automoveis"
            ).hasRole("EMPRESA")

            .requestMatchers(
                HttpMethod.PUT, "/api/automoveis/*"
            ).hasRole("EMPRESA")

            .requestMatchers(
                HttpMethod.DELETE, "/api/automoveis/*"
            ).hasRole("EMPRESA")

            // Consulta de automoveis
            .requestMatchers(
                HttpMethod.GET, "/api/automoveis", "/api/automoveis/*", "/api/automoveis/*/reservas"
            ).authenticated()

            // Criacao antiga de aluguel: bloqueada
            .requestMatchers(
                HttpMethod.POST, "/api/alugueis"
            ).denyAll()

            // Consulta por cliente arbitrario: bloqueada
            .requestMatchers(
                "/api/alugueis/cliente/**"
            ).denyAll()

            // Consulta administrativa de alugueis
            .requestMatchers(
                HttpMethod.GET, "/api/alugueis", "/api/alugueis/*"
            ).hasAnyRole("EMPRESA", "BANCO")

            // Alteracao administrativa de status
            .requestMatchers(
                HttpMethod.PATCH, "/api/alugueis/*/status"
            ).hasAnyRole("EMPRESA", "BANCO")

            .requestMatchers(HttpMethod.PUT, "/api/alugueis/*")
                .hasAnyRole("EMPRESA", "BANCO")
            .requestMatchers(HttpMethod.POST, "/api/alugueis/*/contrato")
                .hasAnyRole("EMPRESA", "BANCO")
            .requestMatchers(HttpMethod.POST, "/api/alugueis/*/credito")
                .hasRole("BANCO")

            // Bloqueia endpoints nao previstos
            .anyRequest().denyAll()
        )
        .httpBasic(Customizer.withDefaults());

    return http.build();
}

}
