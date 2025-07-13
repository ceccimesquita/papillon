package br.com.papillon.eventos.metodoDePagamento.exceptions;

public class MetodoPagamentoNotFoundException extends RuntimeException {
    public MetodoPagamentoNotFoundException(Long id) {
        super("Método de Pagamento com ID " + id + " não encontrado.");
    }
}
