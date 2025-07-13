package br.com.papillon.eventos.cliente.dtos;

import br.com.papillon.eventos.cliente.entities.Cliente;

public record ClienteDto(
        String nome,
        String email,
        String cpfCnpj,
        String telefone

){
    public ClienteDto(Cliente cliente) {
        this(cliente.getNome(),
                cliente.getEmail(),
                cliente.getCpfCnpj(),
                cliente.getTelefone());
    }
}
