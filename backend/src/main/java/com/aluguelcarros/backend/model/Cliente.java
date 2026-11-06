
package com.aluguelcarros.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "clientes")
public class Cliente {

    @jakarta.persistence.ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.CollectionTable(name = "cliente_empregadores",
            joinColumns = @jakarta.persistence.JoinColumn(name = "cliente_id"))
    @jakarta.persistence.OrderColumn(name = "ordem")
    private java.util.List<Empregador> empregadores = new java.util.ArrayList<>();

    public java.util.List<Empregador> getEmpregadores() { return empregadores; }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String rg;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String endereco;

    @Column(nullable = false)
    private String profissao;

    public Cliente() {
    }

    public Cliente(String rg, String cpf, String nome,
                   String endereco, String profissao) {
        this.rg = rg;
        this.cpf = cpf;
        this.nome = nome;
        this.endereco = endereco;
        this.profissao = profissao;
    }

    public Long getId() {
        return id;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getProfissao() {
        return profissao;
    }

    public void setProfissao(String profissao) {
        this.profissao = profissao;
    }
}
