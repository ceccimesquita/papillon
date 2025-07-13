package br.com.papillon.eventos.cliente.exceptions;

public class ClienteAlreadyExistsException extends RuntimeException {
    public ClienteAlreadyExistsException(String cpfCnpj) {
        super("Cliente com CPF/CNPJ '" + cpfCnpj + "' já existe.");
    }
}
