    package br.com.papillon.eventos.insumos.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import br.com.papillon.eventos.insumos.entities.Insumo;

public record InsumoDto(
        Long id,

        @NotBlank
        @Size(max = 100)
        String nome,

        @NotNull
        BigDecimal valor,
        
        String metodoPagamento,

        @NotNull
        Long eventoId
) {
    public InsumoDto(Insumo insumo) {
        this(
                insumo.getId(),
                insumo.getNome(),
                insumo.getValor(),
                insumo.getMetodoPagamento(),
                insumo.getEvento().getId()
        );
    }
}