package br.com.papillon.eventos.insumos.entities;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;

@Entity
@Table(name = "insumos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nome;

    @NotNull
    private BigDecimal valor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "metodo_pagamento_id")
    private MetodoPagamento metodoPagamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id")
    private Evento evento;

    public Insumo(String nome, BigDecimal valor, MetodoPagamento metodoPagamento, Evento evento) {
        this.nome = nome;
        this.valor = valor;
        this.metodoPagamento = metodoPagamento;
        this.evento = evento;
    }
}
