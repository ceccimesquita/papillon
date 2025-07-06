package br.com.papillon.eventos.insumos.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;

public record InsumoDto(
        Long id,

        @NotBlank
        @Size(max = 100)
        String nome,

        @NotNull
        BigDecimal valor,

        @NotNull
        MetodoPagamentoDto metodoPagamento,  // agora é o objeto inteiro

        @NotNull
        Long eventoId
) {
    public InsumoDto(Insumo insumo) {
        this(
                insumo.getId(),
                insumo.getNome(),
                insumo.getValor(),
                new MetodoPagamentoDto(insumo.getMetodoPagamento()),
                insumo.getEvento().getId()
        );
    }
}