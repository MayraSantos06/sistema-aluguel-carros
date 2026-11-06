
package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.model.Usuario;
import com.aluguelcarros.backend.repository.UsuarioRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new UsernameNotFoundException(
                "Usuario nao encontrado"
            ));

        return new User(
            usuario.getLogin(),
            usuario.getSenhaHash(),
            List.of(new SimpleGrantedAuthority(
                "ROLE_" + usuario.getPerfil().name()
            ))
        );
    }
}
