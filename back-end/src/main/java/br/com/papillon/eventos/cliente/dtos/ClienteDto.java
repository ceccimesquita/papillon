package br.com.papillon.eventos.cliente.dtos;

import br.com.papillon.eventos.cliente.entities.Cliente;

public record ClienteDto(
        Long id,
        String nome,
        String email,
        String cpfCnpj,
        String telefone
){
    public ClienteDto(Cliente cliente) {
        this(cliente.getId(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getCpfCnpj(),
                cliente.getTelefone());
    }
}
