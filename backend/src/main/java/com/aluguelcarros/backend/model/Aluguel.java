
package com.aluguelcarros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "alugueis")
public class Aluguel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "automovel_id", nullable = false)
    private Automovel automovel;

    @Column(nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false)
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAluguel status = StatusAluguel.PENDENTE;

    private LocalDate dataPedido = LocalDate.now();
    private LocalDate dataParecer;
    private String agenteParecer;
    private String observacaoParecer;
    private LocalDate dataContrato;
    private String agenteContrato;
    @Enumerated(EnumType.STRING)
    private PerfilUsuario tipoProprietario;
    private String proprietario;
    private java.math.BigDecimal valorCredito;
    private LocalDate dataCredito;
    private String bancoCredito;

    public LocalDate getDataPedido() { return dataPedido; }
    public LocalDate getDataParecer() { return dataParecer; }
    public String getAgenteParecer() { return agenteParecer; }
    public String getObservacaoParecer() { return observacaoParecer; }
    public LocalDate getDataContrato() { return dataContrato; }
    public String getAgenteContrato() { return agenteContrato; }
    public PerfilUsuario getTipoProprietario() { return tipoProprietario; }
    public String getProprietario() { return proprietario; }
    public java.math.BigDecimal getValorCredito() { return valorCredito; }
    public LocalDate getDataCredito() { return dataCredito; }
    public String getBancoCredito() { return bancoCredito; }

    public void registrarParecer(String agente, String observacao) {
        this.dataParecer = LocalDate.now();
        this.agenteParecer = agente;
        this.observacaoParecer = observacao;
    }

    public void formalizar(PerfilUsuario tipo, String nome, String agente) {
        this.dataContrato = LocalDate.now();
        this.agenteContrato = agente;
        this.tipoProprietario = tipo;
        this.proprietario = nome;
    }

    public void registrarCredito(java.math.BigDecimal valor, String banco) {
        this.valorCredito = valor;
        this.dataCredito = LocalDate.now();
        this.bancoCredito = banco;
    }

    public Aluguel() {}

    public Long getId() { return id; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Automovel getAutomovel() { return automovel; }
    public void setAutomovel(Automovel automovel) {
        this.automovel = automovel;
    }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public StatusAluguel getStatus() { return status; }
    public void setStatus(StatusAluguel status) {
        this.status = status;
    }
}
