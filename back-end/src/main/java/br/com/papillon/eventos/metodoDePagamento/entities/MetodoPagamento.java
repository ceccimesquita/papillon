package br.com.papillon.eventos.metodoDePagamento.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

@Entity
@Table(name = "metodos_pagamento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    private String nome;

    @NotNull
    private BigDecimal valor;

    @NotNull
    private LocalDate data;

    // **não** precisa do insumo aqui, é unidirecional
    public MetodoPagamento(MetodoPagamentoDto dto) {
        this.nome  = dto.nome();
        this.valor = dto.valor();
        this.data  = dto.data();
    }
}
