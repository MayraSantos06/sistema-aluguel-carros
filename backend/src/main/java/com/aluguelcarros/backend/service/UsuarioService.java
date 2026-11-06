
package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.model.Cliente;
import com.aluguelcarros.backend.model.PerfilUsuario;
import com.aluguelcarros.backend.model.Usuario;
import com.aluguelcarros.backend.repository.ClienteRepository;
import com.aluguelcarros.backend.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.aluguelcarros.backend.model.Cliente;
import com.aluguelcarros.backend.repository.ClienteRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario cadastrarCliente(String login, String senha) {

        if (login == null || login.isBlank()
                || senha == null || senha.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Login e senha sao obrigatorios"
            );
        }
        login = login.strip();
        if (login.contains(":") || login.length() > 255
                || senha.length() < 6 || senha.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Use um login sem dois-pontos e uma senha de pelo menos seis caracteres e até 72 bytes");
        }

        if (usuarioRepository.existsByLogin(login)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Login ja cadastrado"
            );
        }

        String senhaHash = passwordEncoder.encode(senha);

        Usuario usuario = new Usuario(
            login,
            senhaHash,
            PerfilUsuario.CLIENTE
        );

        return usuarioRepository.save(usuario);
    }

    public Usuario vincularCliente(String login, Cliente cliente) {

    Usuario usuario = usuarioRepository.findByLogin(login)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Usuario nao encontrado"
        ));

    if (usuario.getPerfil() != PerfilUsuario.CLIENTE) {
        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN,
            "Somente usuarios CLIENTE podem receber esse vinculo"
        );
    }

    if (usuario.getCliente() != null) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Usuario ja possui cliente vinculado"
        );
    }

    usuario.setCliente(cliente);

    return usuarioRepository.save(usuario);
}


public Usuario buscarPorLogin(String login) {
    return usuarioRepository.findByLogin(login)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Usuario nao encontrado"
        ));
}

}
