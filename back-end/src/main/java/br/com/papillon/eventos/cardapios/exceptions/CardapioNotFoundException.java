package br.com.papillon.eventos.cardapios.exceptions;

public class CardapioNotFoundException extends RuntimeException {
    public CardapioNotFoundException(Long id) {
        super("Cardápio com id " + id + " não encontrado");
    }
}

