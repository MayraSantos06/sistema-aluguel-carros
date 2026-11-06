
package com.aluguelcarros.backend.repository;

import com.aluguelcarros.backend.model.Aluguel;
import com.aluguelcarros.backend.model.StatusAluguel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AluguelRepository extends JpaRepository<Aluguel, Long> {

    List<Aluguel> findByClienteId(Long clienteId);
    boolean existsByClienteId(Long clienteId);
    boolean existsByAutomovelId(Long automovelId);

    List<Aluguel> findByAutomovelIdAndStatusAndDataFimGreaterThanEqualOrderByDataInicio(
            Long automovelId, StatusAluguel status, LocalDate hoje);

    @Query("select a.automovel.id from Aluguel a where a.id = :id")
    Optional<Long> buscarAutomovelId(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select a from Aluguel a where a.automovel.id = :automovel
            and a.status = :status and a.id > :id
            and a.dataInicio <= :fim and a.dataFim >= :inicio order by a.id
            """)
    List<Aluguel> bloquearPosterioresSobrepostos(@Param("automovel") Long automovel,
            @Param("status") StatusAluguel status, @Param("id") Long id,
            @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    Optional<Aluguel> findFirstByAutomovelIdAndStatusAndIdLessThanAndDataInicioLessThanEqualAndDataFimGreaterThanEqualOrderById(
            Long automovelId, StatusAluguel status, Long id, LocalDate fim, LocalDate inicio);

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
