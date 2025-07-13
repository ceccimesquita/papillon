// br.com.papillon.eventos.orcamento/exceptions/OrcamentoNotFoundException.java
package br.com.papillon.eventos.orcamento.exception;

public class OrcamentoNotFoundException extends RuntimeException {
    public OrcamentoNotFoundException(Long id) {
        super("Orçamento com ID " + id + " não encontrado.");
    }
}
