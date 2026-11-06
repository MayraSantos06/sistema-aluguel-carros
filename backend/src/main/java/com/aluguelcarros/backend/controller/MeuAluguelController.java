package com.aluguelcarros.backend.controller;

import com.aluguelcarros.backend.dto.AluguelRespostaDTO;
import com.aluguelcarros.backend.dto.MinhaSolicitacaoAluguelDTO;
import com.aluguelcarros.backend.service.MeuAluguelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/meus-alugueis")
public class MeuAluguelController {
    private final MeuAluguelService service;

    public MeuAluguelController(MeuAluguelService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AluguelRespostaDTO> solicitar(
            Authentication authentication, @Valid @RequestBody MinhaSolicitacaoAluguelDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AluguelRespostaDTO.de(service.solicitar(authentication.getName(), dados)));
    }

    @GetMapping
    public List<AluguelRespostaDTO> listar(Authentication authentication) {
        return service.listar(authentication.getName()).stream()
                .map(AluguelRespostaDTO::de).toList();
    }

    @PutMapping("/{id}")
    public AluguelRespostaDTO atualizar(Authentication auth, @PathVariable Long id,
            @Valid @RequestBody MinhaSolicitacaoAluguelDTO dados) {
        return AluguelRespostaDTO.de(service.atualizar(auth.getName(), id, dados));
    }

    @PatchMapping("/{id}/cancelamento")
    public AluguelRespostaDTO cancelar(Authentication auth, @PathVariable Long id) {
        return AluguelRespostaDTO.de(service.cancelar(auth.getName(), id));
    }
}
