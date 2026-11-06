package com.aluguelcarros.backend.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Embeddable
public record Empregador(@NotBlank @Size(max = 255) String nome,
                        @NotNull @PositiveOrZero @Digits(integer = 20, fraction = 2)
                        BigDecimal rendimento) {}
