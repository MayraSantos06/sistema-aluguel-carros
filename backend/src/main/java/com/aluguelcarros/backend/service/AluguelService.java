
package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.dto.SolicitacaoAluguelDTO;
import com.aluguelcarros.backend.model.*;
import com.aluguelcarros.backend.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.aluguelcarros.backend.dto.MinhaSolicitacaoAluguelDTO;
import java.math.BigDecimal;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AluguelService {

    private final AluguelRepository aluguelRepository;
    private final ClienteRepository clienteRepository;
    private final AutomovelRepository automovelRepository;
    private final MeuAluguelService meuAluguelService;
    private final UsuarioRepository usuarioRepository;

    public AluguelService(
            AluguelRepository aluguelRepository,
            ClienteRepository clienteRepository,
            AutomovelRepository automovelRepository, MeuAluguelService meuAluguelService,
            UsuarioRepository usuarioRepository) {

        this.aluguelRepository = aluguelRepository;
        this.clienteRepository = clienteRepository;
        this.automovelRepository = automovelRepository;
        this.meuAluguelService = meuAluguelService;
        this.usuarioRepository = usuarioRepository;
    }

    public Aluguel solicitar(SolicitacaoAluguelDTO dados) {

        if (dados.dataInicio() == null ||
            dados.dataFim() == null ||
            dados.dataFim().isBefore(dados.dataInicio())) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Periodo de aluguel invalido"
            );
        }

        Cliente cliente = clienteRepository.findById(dados.clienteId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Cliente nao encontrado"
            ));

        Automovel automovel = automovelRepository.findById(
            dados.automovelId()
        ).orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Automovel nao encontrado"
        ));

        Aluguel aluguel = new Aluguel();
        aluguel.setCliente(cliente);
        aluguel.setAutomovel(automovel);
        aluguel.setDataInicio(dados.dataInicio());
        aluguel.setDataFim(dados.dataFim());
        aluguel.setStatus(StatusAluguel.PENDENTE);

        return aluguelRepository.save(aluguel);
    }

    public List<Aluguel> listar() {
        return aluguelRepository.findAll(Sort.by("id"));
    }

    public List<Aluguel> listarPorCliente(Long clienteId) {
        return aluguelRepository.findByClienteId(clienteId);
    }

    public Aluguel buscar(Long id) {
        return aluguelRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Aluguel nao encontrado"
            ));
    }


    @Transactional
    public Aluguel alterarStatus(Long id, StatusAluguel novoStatus, String agente, String observacao) {
        if (novoStatus != StatusAluguel.APROVADO && novoStatus != StatusAluguel.RECUSADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transição de status não permitida");
        }
        Long automovelId = aluguelRepository.buscarAutomovelId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        // Mantém a ordem dos bloqueios igual à da edição e do envio de novos pedidos.
        meuAluguelService.bloquearAutomovel(automovelId);
        Aluguel aluguel = buscarParaAlterar(id);
        exigirPendente(aluguel);
        if (!aluguel.getAutomovel().getId().equals(automovelId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O veículo do pedido mudou. Atualize e tente novamente.");
        }

        if (novoStatus == StatusAluguel.APROVADO) {
            aprovar(aluguel, automovelId);
        }
        aluguel.setStatus(novoStatus);
        aluguel.registrarParecer(agente, observacao);
        return aluguel;
    }

    private void aprovar(Aluguel aluguel, Long automovelId) {
        var inicio = aluguel.getDataInicio();
        var fim = aluguel.getDataFim();
        var id = aluguel.getId();
        if (aluguelRepository.existsByAutomovelIdAndStatusAndDataInicioLessThanEqualAndDataFimGreaterThanEqualAndIdNot(
                automovelId, StatusAluguel.APROVADO, fim, inicio, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Automóvel já reservado para este período");
        }
        aluguelRepository.findFirstByAutomovelIdAndStatusAndIdLessThanAndDataInicioLessThanEqualAndDataFimGreaterThanEqualOrderById(
                automovelId, StatusAluguel.PENDENTE, id, fim, inicio).ifPresent(anterior -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "O pedido #" + anterior.getId() + " chegou antes para este veículo e período. Avalie-o primeiro.");
                });
        for (Aluguel posterior : aluguelRepository.bloquearPosterioresSobrepostos(
                automovelId, StatusAluguel.PENDENTE, id, inicio, fim)) {
            posterior.setStatus(StatusAluguel.RECUSADO);
            posterior.registrarParecer("Sistema",
                    "O veículo foi reservado para um pedido recebido antes do seu, com datas sobrepostas. Escolha outro período.");
        }
    }

    @Transactional
    public Aluguel atualizar(Long id, MinhaSolicitacaoAluguelDTO dados) {
        Automovel automovel = meuAluguelService.bloquearAutomovel(dados.automovelId());
        Aluguel aluguel = buscarParaAlterar(id);
        exigirPendente(aluguel);
        return meuAluguelService.atualizarDados(aluguel, dados, automovel);
    }

    @Transactional
    public Aluguel formalizar(Long id, PerfilUsuario tipo, String proprietario, String agente) {
        Aluguel aluguel = buscarParaAlterar(id);
        if (aluguel.getStatus() != StatusAluguel.APROVADO || aluguel.getDataContrato() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O pedido precisa estar aprovado e sem contrato");
        }
        String dono = tipo == PerfilUsuario.CLIENTE ? aluguel.getCliente().getNome()
                : usuarioRepository.findByLogin(proprietario.strip())
                    .filter(usuario -> usuario.getPerfil() == tipo)
                    .map(Usuario::getLogin)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Informe um usuário cadastrado com o perfil do proprietário"));
        aluguel.formalizar(tipo, dono, agente);
        return aluguel;
    }

    @Transactional
    public Aluguel registrarCredito(Long id, BigDecimal valor, String banco) {
        Aluguel aluguel = buscarParaAlterar(id);
        if (aluguel.getDataContrato() == null || aluguel.getDataCredito() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O aluguel precisa ter contrato e ainda não possuir crédito");
        }
        aluguel.registrarCredito(valor, banco);
        return aluguel;
    }

    private Aluguel buscarParaAlterar(Long id) {
        return aluguelRepository.buscarParaAlterar(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }

    static void exigirPendente(Aluguel aluguel) {
        if (aluguel.getStatus() != StatusAluguel.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Somente pedidos pendentes podem ser alterados");
        }
    }

}
