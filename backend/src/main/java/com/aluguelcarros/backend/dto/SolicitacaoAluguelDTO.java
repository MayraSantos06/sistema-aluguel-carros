
package com.aluguelcarros.backend.dto;

import java.time.LocalDate;

public record SolicitacaoAluguelDTO(
    Long clienteId,
    Long automovelId,
    LocalDate dataInicio,
    LocalDate dataFim
) {}
