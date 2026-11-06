
package com.aluguelcarros.backend.repository;

import com.aluguelcarros.backend.model.Aluguel;
import com.aluguelcarros.backend.model.StatusAluguel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AluguelRepository extends JpaRepository<Aluguel, Long> {

    List<Aluguel> findByClienteId(Long clienteId);
    boolean existsByClienteId(Long clienteId);
    boolean existsByAutomovelId(Long automovelId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from Aluguel a where a.id = :id")
    java.util.Optional<Aluguel> buscarParaAlterar(@org.springframework.data.repository.query.Param("id") Long id);

    boolean existsByAutomovelIdAndStatusAndDataInicioLessThanEqualAndDataFimGreaterThanEqualAndIdNot(
        Long automovelId,
        StatusAluguel status,
        LocalDate dataFim,
        LocalDate dataInicio,
        Long id
    );
}
