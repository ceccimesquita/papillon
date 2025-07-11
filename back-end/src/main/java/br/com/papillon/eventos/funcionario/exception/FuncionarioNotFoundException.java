package br.com.papillon.eventos.funcionario.exception;

public class FuncionarioNotFoundException extends RuntimeException {
    public FuncionarioNotFoundException(Long id) {
        super("Funcionário com ID " + id + " não encontrado.");
    }
}
