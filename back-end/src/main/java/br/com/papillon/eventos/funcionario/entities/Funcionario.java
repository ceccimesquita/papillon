package br.com.papillon.eventos.funcionario.entities;

import java.math.BigDecimal;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "funcionarios")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Funcionario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    private String nome;

    @NotBlank @Size(max = 100)
    private String funcao;

    @NotNull
    private BigDecimal valor;

    // 1-1 unidirecional: o Funcionario “conhece” seu MetodoPagamento
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "metodo_pagamento_id", nullable = false)
    private MetodoPagamento metodoPagamento;

    // Muitos funcionários para um evento.
    // JsonIgnoreProperties quebra o laço (não serializa evento.funcionarios)
    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id")
    @JsonIgnoreProperties("funcionarios")
    private Evento evento;

    // Construtor a partir de DTO + evento carregado do banco
    public Funcionario(FuncionarioDto dto, Evento ev) {
        this.nome            = dto.nome();
        this.funcao          = dto.funcao();
        this.valor           = dto.valor();
        this.metodoPagamento = new MetodoPagamento(dto.metodoPagamento());
        this.evento          = ev;
    }
}
