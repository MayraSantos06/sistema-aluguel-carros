package com.aluguelcarros.backend.dto;

import com.aluguelcarros.backend.model.PerfilUsuario;
import com.aluguelcarros.backend.model.Usuario;

public record UsuarioRespostaDTO(
    Long id,
    String login,
    PerfilUsuario perfil
) {
    public static UsuarioRespostaDTO from(Usuario usuario) {
        return new UsuarioRespostaDTO(
            usuario.getId(),
            usuario.getLogin(),
            usuario.getPerfil()
        );
    }
}
