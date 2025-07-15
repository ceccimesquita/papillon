package br.com.papillon.eventos.insumos.exceptions;

public class InsumoNotFoundException extends RuntimeException {
    public InsumoNotFoundException(Long id) {
        super("Insumo com ID " + id + " não encontrado.");
    }
}
