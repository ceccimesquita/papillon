package br.com.papillon.eventos.funcionario.entities;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;

@Entity
@Table(name = "funcionarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nome;

    @NotBlank
    @Size(max = 100)
    private String funcao;

    @NotNull
    private BigDecimal valor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "metodo_pagamento_id")
    private MetodoPagamento metodoPagamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id")
    private Evento evento;

    public Funcionario(
            @NotBlank @Size(max = 100) String nome,
            @NotBlank @Size(max = 100) String funcao,
            @NotNull BigDecimal valor,
            MetodoPagamento metodoPagamento,
            Evento evento) {
        this.nome = nome;
        this.funcao = funcao;
        this.valor = valor;
        this.metodoPagamento = metodoPagamento;
        this.evento = evento;
    }

    public Funcionario(FuncionarioDto dto) {
        this(
                dto.nome(),
                dto.funcao(),
                dto.valor(),
                null,
                null
        );
    }
}
