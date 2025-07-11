package br.com.papillon.eventos.cliente.dtos;

import br.com.papillon.eventos.cliente.entities.Cliente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

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
