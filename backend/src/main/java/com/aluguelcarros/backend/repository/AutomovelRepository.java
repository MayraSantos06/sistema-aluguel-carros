package com.aluguelcarros.backend.repository;

import com.aluguelcarros.backend.model.Automovel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutomovelRepository
        extends JpaRepository<Automovel, Long> {
    boolean existsByPlacaIgnoreCaseAndIdNot(String placa, Long id);
    boolean existsByMatriculaIgnoreCaseAndIdNot(String matricula, Long id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from Automovel a where a.id = :id")
    java.util.Optional<Automovel> buscarParaAlterar(@org.springframework.data.repository.query.Param("id") Long id);
}
