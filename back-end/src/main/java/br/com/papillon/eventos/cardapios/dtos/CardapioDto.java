package br.com.papillon.eventos.cardapios.dtos;

import java.util.List;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cardapios.entities.Item;

public record CardapioDto(Long id, String nome, List<Item> tipo) {
    public CardapioDto(Cardapio c) {
        this(c.getId(), c.getNome(), c.getItens());
    }
}
