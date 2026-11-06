
package com.aluguelcarros.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record MinhaSolicitacaoAluguelDTO(

    @NotNull
    Long automovelId,

    @NotNull
    LocalDate dataInicio,

    @NotNull
    LocalDate dataFim

) {}
