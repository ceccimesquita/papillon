package br.com.papillon.eventos.insumos.dtos;

import br.com.papillon.eventos.insumos.entities.Insumo;

import java.math.BigDecimal;

public record InsumoDto(
        String nome,
        Integer quantidade,
        BigDecimal preco,
        String metodoPagamento,
        Long eventoId
) {
    public InsumoDto(Insumo insumo) {
        this(
                insumo.getNome(),
                insumo.getQuantidade(),
                insumo.getPreco(),
                insumo.getMetodoPagamento(),
                insumo.getEvento() != null ? insumo.getEvento().getId() : null
        );
    }
}
