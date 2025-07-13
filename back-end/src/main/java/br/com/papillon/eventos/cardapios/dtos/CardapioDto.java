package br.com.papillon.eventos.cardapios.dtos;

import br.com.papillon.eventos.cardapios.entities.Cardapio;

public record CardapioDto(Long id, String nome, String tipo) {
    public CardapioDto(Cardapio c) {
        this(c.getId(), c.getNome(), c.getTipo());
    }
}
