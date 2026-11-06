package com.aluguelcarros.backend.controller;

import com.aluguelcarros.backend.dto.AluguelRespostaDTO;
import com.aluguelcarros.backend.dto.MinhaSolicitacaoAluguelDTO;
import com.aluguelcarros.backend.model.PerfilUsuario;
import com.aluguelcarros.backend.model.StatusAluguel;
import com.aluguelcarros.backend.service.AluguelService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.math.BigDecimal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/alugueis")
public class AluguelController {
    private final AluguelService service;

    public AluguelController(AluguelService service) {
        this.service = service;
    }

    @GetMapping
    public List<AluguelRespostaDTO> listar() {
        return service.listar().stream().map(AluguelRespostaDTO::de).toList();
    }

    @GetMapping("/{id}")
    public AluguelRespostaDTO buscar(@PathVariable Long id) {
        return AluguelRespostaDTO.de(service.buscar(id));
    }

    @PatchMapping("/{id}/status")
    public AluguelRespostaDTO alterarStatus(@PathVariable Long id,
            @RequestParam StatusAluguel status,
            @RequestParam(defaultValue = "") @Size(max = 255) String observacao,
            Authentication auth) {
        return AluguelRespostaDTO.de(service.alterarStatus(id, status, auth.getName(), observacao));
    }

    @PutMapping("/{id}")
    public AluguelRespostaDTO atualizar(@PathVariable Long id, @Valid @RequestBody MinhaSolicitacaoAluguelDTO dados) {
        return AluguelRespostaDTO.de(service.atualizar(id, dados));
    }

    public record DadosContrato(@NotNull PerfilUsuario tipo, @Size(max = 255) String proprietario) {
        @AssertTrue(message = "Informe o proprietário do veículo")
        public boolean isProprietarioValido() {
            return tipo == PerfilUsuario.CLIENTE || proprietario != null && !proprietario.isBlank();
        }
    }

    public record DadosCredito(@NotNull @Positive @Digits(integer = 20, fraction = 2) BigDecimal valor) {}

    @PostMapping("/{id}/contrato")
    public AluguelRespostaDTO formalizar(@PathVariable Long id, @Valid @RequestBody DadosContrato dados,
            Authentication auth) {
        return AluguelRespostaDTO.de(service.formalizar(id, dados.tipo(), dados.proprietario(), auth.getName()));
    }

    @PostMapping("/{id}/credito")
    public AluguelRespostaDTO registrarCredito(@PathVariable Long id, @Valid @RequestBody DadosCredito dados,
            Authentication auth) {
        return AluguelRespostaDTO.de(service.registrarCredito(id, dados.valor(), auth.getName()));
    }
}
