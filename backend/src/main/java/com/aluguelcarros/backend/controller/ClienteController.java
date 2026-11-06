
package com.aluguelcarros.backend.controller;

import com.aluguelcarros.backend.model.Cliente;
import com.aluguelcarros.backend.service.ClienteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Cadastrar cliente
    @PostMapping
    public ResponseEntity<Cliente> cadastrar(@RequestBody Cliente cliente) {
        Cliente novoCliente = clienteService.cadastrar(cliente);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(novoCliente);
    }

    // Listar clientes
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteService.listarTodos();
    }

    // Buscar cliente por ID
    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id);
    }

    // Atualizar cliente
    @PutMapping("/{id}")
    public Cliente atualizar(
            @PathVariable Long id,
            @RequestBody Cliente cliente) {

        return clienteService.atualizar(id, cliente);
    }

    // Excluir cliente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        clienteService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
