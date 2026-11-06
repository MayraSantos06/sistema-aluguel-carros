package com.aluguelcarros.backend.controller;

import com.aluguelcarros.backend.dto.CadastroUsuarioDTO;
import com.aluguelcarros.backend.dto.UsuarioRespostaDTO;
import com.aluguelcarros.backend.model.Usuario;
import com.aluguelcarros.backend.repository.UsuarioRepository;
import com.aluguelcarros.backend.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final AuthenticationProvider authenticationProvider;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            UsuarioService usuarioService,
            UsuarioRepository usuarioRepository, AuthenticationProvider authenticationProvider,
            SecurityContextRepository securityContextRepository) {

        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.authenticationProvider = authenticationProvider;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }

    @PostMapping("/entrar")
    public UsuarioRespostaDTO entrar(@RequestBody CadastroUsuarioDTO dados,
            HttpServletRequest request, HttpServletResponse response) {
        Authentication autenticacao;
        try {
            autenticacao = authenticationProvider.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(dados.login(), dados.senha()));
        } catch (AuthenticationException erro) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos");
        }
        if (autenticacao instanceof CredentialsContainer credenciais) {
            credenciais.eraseCredentials();
        }
        request.getSession();
        request.changeSessionId();
        var contexto = SecurityContextHolder.createEmptyContext();
        contexto.setAuthentication(autenticacao);
        securityContextRepository.saveContext(contexto, request, response);
        return usuarioAtual(autenticacao);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioRespostaDTO> cadastrar(
            @RequestBody CadastroUsuarioDTO dados) {

        Usuario usuario = usuarioService.cadastrarCliente(
            dados.login(),
            dados.senha()
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(UsuarioRespostaDTO.from(usuario));
    }

    @GetMapping("/me")
    public UsuarioRespostaDTO usuarioAtual(Authentication authentication) {

        Usuario usuario = usuarioRepository
            .findByLogin(authentication.getName())
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuario nao encontrado"
            ));

        return UsuarioRespostaDTO.from(usuario);
    }
}
