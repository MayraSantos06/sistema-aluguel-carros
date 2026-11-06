package com.aluguelcarros.backend.controller;

import com.aluguelcarros.backend.model.Automovel;
import com.aluguelcarros.backend.service.AutomovelService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automoveis")
public class AutomovelController {

    private final AutomovelService service;

    public AutomovelController(AutomovelService service) {
        this.service = service;
    }

    @GetMapping
    public List<Automovel> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Automovel buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Automovel> cadastrar(
            @RequestBody Automovel automovel) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.cadastrar(automovel));
    }

    @PutMapping("/{id}")
    public Automovel atualizar(
            @PathVariable Long id,
            @RequestBody Automovel automovel) {

        return service.atualizar(id, automovel);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
