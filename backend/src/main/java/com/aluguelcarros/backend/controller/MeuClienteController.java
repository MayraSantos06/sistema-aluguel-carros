package com.aluguelcarros.backend.controller;

import com.aluguelcarros.backend.dto.ClienteRespostaDTO;
import com.aluguelcarros.backend.dto.MeuClienteDTO;
import com.aluguelcarros.backend.service.MeuClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meu-cliente")
public class MeuClienteController {
    private final MeuClienteService service;

    public MeuClienteController(MeuClienteService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ClienteRespostaDTO> cadastrar(
            Authentication authentication, @Valid @RequestBody MeuClienteDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ClienteRespostaDTO.de(service.cadastrar(authentication.getName(), dados)));
    }

    @GetMapping
    public ClienteRespostaDTO buscar(Authentication authentication) {
        return ClienteRespostaDTO.de(service.buscar(authentication.getName()));
    }

    @PutMapping
    public ClienteRespostaDTO atualizar(Authentication auth, @Valid @RequestBody MeuClienteDTO dados) {
        return ClienteRespostaDTO.de(service.atualizar(auth.getName(), dados));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(Authentication auth) {
        service.excluir(auth.getName());
    }
}
