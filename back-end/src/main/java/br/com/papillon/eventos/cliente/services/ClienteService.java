package br.com.papillon.eventos.cliente.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.cliente.dtos.ClienteDetailsDto;
import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.exceptions.ClienteAlreadyExistsException;
import br.com.papillon.eventos.cliente.exceptions.ClienteNotFoundException;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.evento.dtos.EventoSimpleDto;
import br.com.papillon.eventos.evento.services.EventoService;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EventoService eventoService;

    public Cliente registerCliente(ClienteDto clienteDto) {
        if (clienteRepository.existsByCpfCnpj(clienteDto.cpfCnpj())) {
            throw new ClienteAlreadyExistsException(clienteDto.cpfCnpj());
        }
        Cliente novoCliente = new Cliente(clienteDto);
        return clienteRepository.save(novoCliente);
    }

    public List<ClienteDto> listAllClientes() {
        List<Cliente> clientes = clienteRepository.findAll();
        return clientes.stream()
                .map(ClienteDto::new)
                .collect(Collectors.toList());
    }

    public ClienteDto getClienteById(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteNotFoundException(id));
        return new ClienteDto(cliente);
    }

    public ClienteDetailsDto getClienteDetailsById(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteNotFoundException(id));
        List<EventoSimpleDto> eventos = eventoService.getEventosSimplesByClienteId(id);
        return new ClienteDetailsDto(cliente, eventos);
    }


    public ClienteDto updateClienteById(Long id, ClienteDto clienteDto) {
        Cliente clienteExistente = clienteRepository.findById(id)
                .orElseThrow(() -> new ClienteNotFoundException(id));
        Cliente clienteAtualizado = new Cliente(clienteDto);
        clienteAtualizado.setId(id);
        clienteRepository.save(clienteAtualizado);
        return new ClienteDto(clienteAtualizado);
    }

    public void deleteClienteById(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ClienteNotFoundException(id);
        }
        clienteRepository.deleteById(id);
    }

    public Cliente getByCpfCnpjOrCreate(ClienteDto dto) {
        return clienteRepository.findByCpfCnpj(dto.cpfCnpj())
                .orElseGet(() -> clienteRepository.save(new Cliente(dto)));
    }
}
