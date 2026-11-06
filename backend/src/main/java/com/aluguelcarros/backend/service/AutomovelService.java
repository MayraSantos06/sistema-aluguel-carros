package com.aluguelcarros.backend.service;

import com.aluguelcarros.backend.model.Automovel;
import com.aluguelcarros.backend.repository.AutomovelRepository;
import com.aluguelcarros.backend.repository.AluguelRepository;

import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AutomovelService {

    private final AutomovelRepository repository;
    private final AluguelRepository alugueis;

    public AutomovelService(AutomovelRepository repository, AluguelRepository alugueis) {
        this.repository = repository;
        this.alugueis = alugueis;
    }

    public List<Automovel> listar() {
        return repository.findAll();
    }

    public Automovel buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Automovel nao encontrado"
            ));
    }

    public Automovel cadastrar(Automovel automovel) {
        validar(automovel, 0L);
        automovel.setId(null);
        return salvar(automovel);
    }

    public Automovel atualizar(Long id, Automovel dados) {
        Automovel automovel = buscar(id);
        validar(dados, id);

        automovel.setMatricula(dados.getMatricula());
        automovel.setMarca(dados.getMarca());
        automovel.setModelo(dados.getModelo());
        automovel.setAno(dados.getAno());
        automovel.setPlaca(dados.getPlaca());

        return salvar(automovel);
    }

    public void excluir(Long id) {
        Automovel automovel = buscar(id);
        if (alugueis.existsByAutomovelId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O automóvel possui pedidos vinculados");
        }
        repository.delete(automovel);
    }

    private void validar(Automovel dados, Long id) {
        if (vazio(dados.getMarca()) || vazio(dados.getModelo()) || vazio(dados.getMatricula())
                || vazio(dados.getPlaca()) || dados.getAno() == null || dados.getAno() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preencha os dados obrigatórios do automóvel");
        }
        dados.setMatricula(dados.getMatricula().strip().toUpperCase(java.util.Locale.ROOT));
        dados.setPlaca(dados.getPlaca().strip().toUpperCase(java.util.Locale.ROOT));
        if (repository.existsByPlacaIgnoreCaseAndIdNot(dados.getPlaca(), id)
                || repository.existsByMatriculaIgnoreCaseAndIdNot(dados.getMatricula(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Placa ou matrícula já cadastrada");
        }
    }

    private boolean vazio(String valor) {
        return valor == null || valor.isBlank();
    }

    private Automovel salvar(Automovel automovel) {
        try {
            return repository.save(automovel);
        } catch (DataIntegrityViolationException erro) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Placa ou matrícula já cadastrada", erro);
        }
    }
}
