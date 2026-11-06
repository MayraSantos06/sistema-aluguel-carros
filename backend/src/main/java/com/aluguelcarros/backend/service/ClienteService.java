
package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.model.Cliente;
import com.aluguelcarros.backend.repository.ClienteRepository;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // Cadastrar cliente
    public Cliente cadastrar(Cliente cliente) {

        if (clienteRepository.existsByCpf(cliente.getCpf())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "CPF ja cadastrado"
            );
        }

        return clienteRepository.save(cliente);
    }

    // Listar todos os clientes
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    // Buscar cliente pelo ID
    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cliente nao encontrado"
            ));
    }

    // Atualizar cliente
    public Cliente atualizar(Long id, Cliente dados) {

        Cliente cliente = buscarPorId(id);

        if (!cliente.getCpf().equals(dados.getCpf())
                && clienteRepository.existsByCpf(dados.getCpf())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "CPF ja cadastrado"
            );
        }

        cliente.setRg(dados.getRg());
        cliente.setCpf(dados.getCpf());
        cliente.setNome(dados.getNome());
        cliente.setEndereco(dados.getEndereco());
        cliente.setProfissao(dados.getProfissao());

        return clienteRepository.save(cliente);
    }

    // Excluir cliente
    public void excluir(Long id) {

        Cliente cliente = buscarPorId(id);
        clienteRepository.delete(cliente);
    }
}
