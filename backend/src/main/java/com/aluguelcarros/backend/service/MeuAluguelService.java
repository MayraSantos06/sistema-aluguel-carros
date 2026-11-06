
package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.dto.MinhaSolicitacaoAluguelDTO;
import com.aluguelcarros.backend.model.*;
import com.aluguelcarros.backend.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class MeuAluguelService {

    private final UsuarioRepository usuarioRepository;
    private final AutomovelRepository automovelRepository;
    private final AluguelRepository aluguelRepository;

    public MeuAluguelService(
            UsuarioRepository usuarioRepository,
            AutomovelRepository automovelRepository,
            AluguelRepository aluguelRepository) {

        this.usuarioRepository = usuarioRepository;
        this.automovelRepository = automovelRepository;
        this.aluguelRepository = aluguelRepository;
    }

    private Cliente obterCliente(String login) {

        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuario nao encontrado"
            ));

        if (usuario.getPerfil() != PerfilUsuario.CLIENTE) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Acesso permitido apenas para clientes"
            );
        }

        if (usuario.getCliente() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Complete seu cadastro de cliente primeiro"
            );
        }

        return usuario.getCliente();
    }

    @Transactional
    public Aluguel solicitar(
            String login,
            MinhaSolicitacaoAluguelDTO dados) {

        Cliente cliente = obterCliente(login);
        Aluguel aluguel = new Aluguel();
        aluguel.setCliente(cliente);
        return atualizarDados(aluguel, dados);
    }

    Aluguel atualizarDados(Aluguel aluguel, MinhaSolicitacaoAluguelDTO dados) {
        if (dados.dataInicio() == null
                || dados.dataFim() == null
                || dados.dataInicio().isBefore(LocalDate.now())
                || dados.dataFim().isBefore(dados.dataInicio())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Periodo de aluguel invalido"
            );
        }

        Automovel automovel = automovelRepository
            .findById(dados.automovelId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Automovel nao encontrado"
            ));

        aluguel.setAutomovel(automovel);
        aluguel.setDataInicio(dados.dataInicio());
        aluguel.setDataFim(dados.dataFim());

        return aluguelRepository.save(aluguel);
    }

    @Transactional(readOnly = true)
    public List<Aluguel> listar(String login) {

        Usuario usuario = usuarioRepository.findByLogin(login).orElseThrow();
        return usuario.getCliente() == null ? List.of()
                : aluguelRepository.findByClienteId(usuario.getCliente().getId());
    }

    @Transactional
    public Aluguel atualizar(String login, Long id, MinhaSolicitacaoAluguelDTO dados) {
        return atualizarDados(obterPendente(login, id), dados);
    }

    @Transactional
    public Aluguel cancelar(String login, Long id) {
        Aluguel aluguel = obterPendente(login, id);
        aluguel.setStatus(StatusAluguel.CANCELADO);
        return aluguel;
    }

    private Aluguel obterPendente(String login, Long id) {
        Cliente cliente = obterCliente(login);
        Aluguel aluguel = aluguelRepository.buscarParaAlterar(id)
                .filter(item -> item.getCliente().getId().equals(cliente.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        AluguelService.exigirPendente(aluguel);
        return aluguel;
    }
}
