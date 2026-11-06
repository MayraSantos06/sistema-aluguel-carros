
package com.aluguelcarros.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import com.aluguelcarros.backend.model.Empregador;

public record MeuClienteDTO(

    @NotBlank(message = "RG obrigatorio")
    String rg,

    @NotBlank(message = "CPF obrigatorio")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 digitos")
    String cpf,

    @NotBlank(message = "Nome obrigatorio")
    String nome,

    @NotBlank(message = "Endereco obrigatorio")
    String endereco,

    @NotBlank(message = "Profissao obrigatoria")
    String profissao,

    @jakarta.validation.constraints.Size(max = 3)
    java.util.List<@jakarta.validation.Valid @jakarta.validation.constraints.NotNull Empregador> empregadores
) {}
