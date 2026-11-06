
package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.dto.MeuClienteDTO;
import com.aluguelcarros.backend.model.Cliente;
import com.aluguelcarros.backend.model.PerfilUsuario;
import com.aluguelcarros.backend.model.Usuario;
import com.aluguelcarros.backend.repository.ClienteRepository;
import com.aluguelcarros.backend.repository.AluguelRepository;
import com.aluguelcarros.backend.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MeuClienteService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final AluguelRepository aluguelRepository;

    public MeuClienteService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository, AluguelRepository aluguelRepository) {

        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.aluguelRepository = aluguelRepository;
    }

    @Transactional
    public Cliente cadastrar(String login, MeuClienteDTO dados) {

        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario nao encontrado"
            ));

        if (usuario.getPerfil() != PerfilUsuario.CLIENTE) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Operacao permitida apenas para clientes"
            );
        }

        if (usuario.getCliente() != null) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Usuario ja possui cadastro de cliente"
            );
        }

        if (clienteRepository.existsByCpf(dados.cpf())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "CPF ja cadastrado"
            );
        }

        Cliente cliente = new Cliente();

        preencher(cliente, dados);

        cliente = clienteRepository.save(cliente);

        usuario.setCliente(cliente);
        usuarioRepository.save(usuario);

        return cliente;
    }

    @Transactional(readOnly = true)
    public Cliente buscar(String login) {

        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario nao encontrado"
            ));

        if (usuario.getPerfil() != PerfilUsuario.CLIENTE) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Operacao permitida apenas para clientes"
            );
        }

        if (usuario.getCliente() == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cliente ainda nao cadastrado"
            );
        }

        return usuario.getCliente();
    }

    @Transactional
    public Cliente atualizar(String login, MeuClienteDTO dados) {
        Cliente cliente = buscar(login);
        if (!cliente.getCpf().equals(dados.cpf()) && clienteRepository.existsByCpf(dados.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        preencher(cliente, dados);
        return cliente;
    }

    @Transactional
    public void excluir(String login) {
        Cliente cliente = buscar(login);
        if (aluguelRepository.existsByClienteId(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O cadastro possui pedidos vinculados");
        }
        Usuario usuario = usuarioRepository.findByLogin(login).orElseThrow();
        usuario.setCliente(null);
        usuarioRepository.flush();
        clienteRepository.delete(cliente);
    }

    private void preencher(Cliente cliente, MeuClienteDTO dados) {
        cliente.setRg(dados.rg());
        cliente.setCpf(dados.cpf());
        cliente.setNome(dados.nome());
        cliente.setEndereco(dados.endereco());
        cliente.setProfissao(dados.profissao());
        cliente.getEmpregadores().clear();
        if (dados.empregadores() != null) {
            cliente.getEmpregadores().addAll(dados.empregadores());
        }
    }
}
