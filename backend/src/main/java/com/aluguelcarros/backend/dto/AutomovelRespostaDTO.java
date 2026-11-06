package com.aluguelcarros.backend.dto;

import com.aluguelcarros.backend.model.Automovel;

public record AutomovelRespostaDTO(Long id, String matricula, String marca,
                                   String modelo, String placa, Integer ano) {
    public static AutomovelRespostaDTO de(Automovel automovel) {
        return new AutomovelRespostaDTO(automovel.getId(), automovel.getMatricula(),
                automovel.getMarca(), automovel.getModelo(), automovel.getPlaca(), automovel.getAno());
    }
}
