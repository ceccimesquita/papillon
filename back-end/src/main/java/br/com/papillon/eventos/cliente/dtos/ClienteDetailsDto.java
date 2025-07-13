package br.com.papillon.eventos.cliente.dtos;

import java.util.List;

import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.evento.dtos.EventoSimpleDto;

public record ClienteDetailsDto(
        String nome,
        String email,
        String cpfCnpj,
        String telefone,
        List<EventoSimpleDto> eventos
){
    public ClienteDetailsDto(Cliente cliente, List<EventoSimpleDto> eventos) {
        this(cliente.getNome(),
                cliente.getEmail(),
                cliente.getCpfCnpj(),
                cliente.getTelefone(),
                eventos);
    }
}
