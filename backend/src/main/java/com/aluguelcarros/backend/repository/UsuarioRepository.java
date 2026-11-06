
package com.aluguelcarros.backend.repository;

import com.aluguelcarros.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByLogin(String login);

    boolean existsByLogin(String login);

    Optional<Usuario> findByClienteId(Long clienteId);
}
