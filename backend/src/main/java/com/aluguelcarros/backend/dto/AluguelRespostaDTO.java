package com.aluguelcarros.backend.dto;

import com.aluguelcarros.backend.model.Aluguel;
import com.aluguelcarros.backend.model.StatusAluguel;
import java.time.LocalDate;

public record AluguelRespostaDTO(Long id, ClienteRespostaDTO cliente,
        AutomovelRespostaDTO automovel, LocalDate dataInicio, LocalDate dataFim,
        StatusAluguel status, LocalDate dataPedido, LocalDate dataParecer, String agenteParecer,
        String observacaoParecer, LocalDate dataContrato, String agenteContrato,
        String tipoProprietario, String proprietario,
        java.math.BigDecimal valorCredito, LocalDate dataCredito, String bancoCredito) {
    public static AluguelRespostaDTO de(Aluguel aluguel) {
        return new AluguelRespostaDTO(aluguel.getId(),
                ClienteRespostaDTO.de(aluguel.getCliente()),
                AutomovelRespostaDTO.de(aluguel.getAutomovel()),
                aluguel.getDataInicio(), aluguel.getDataFim(), aluguel.getStatus(),
                aluguel.getDataPedido(), aluguel.getDataParecer(), aluguel.getAgenteParecer(),
                aluguel.getObservacaoParecer(), aluguel.getDataContrato(), aluguel.getAgenteContrato(),
                aluguel.getTipoProprietario() == null ? null : aluguel.getTipoProprietario().name(),
                aluguel.getProprietario(), aluguel.getValorCredito(), aluguel.getDataCredito(),
                aluguel.getBancoCredito());
    }
}
