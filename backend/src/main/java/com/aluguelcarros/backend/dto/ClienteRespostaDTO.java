package com.aluguelcarros.backend.dto;

import com.aluguelcarros.backend.model.Cliente;

public record ClienteRespostaDTO(Long id, String rg, String cpf, String nome,
                                  String endereco, String profissao,
                                  java.util.List<com.aluguelcarros.backend.model.Empregador> empregadores) {
    public static ClienteRespostaDTO de(Cliente cliente) {
        return new ClienteRespostaDTO(cliente.getId(), cliente.getRg(), cliente.getCpf(),
                cliente.getNome(), cliente.getEndereco(), cliente.getProfissao(),
                java.util.List.copyOf(cliente.getEmpregadores()));
    }
}
