package br.com.papillon.eventos.cliente;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.cliente.dtos.ClienteDetailsDto;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.exceptions.ClienteAlreadyExistsException;
import br.com.papillon.eventos.cliente.exceptions.ClienteNotFoundException;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.cliente.services.ClienteService;
import br.com.papillon.eventos.evento.dtos.EventoSimpleDto;
import br.com.papillon.eventos.evento.services.EventoService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClienteServiceTests {

    @InjectMocks
    private ClienteService clienteService;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private EventoService eventoService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    private Cliente buildCliente(String nome, String cpf, String email, String cidade) {
        Cliente c = new Cliente();
        c.setNome(nome);
        c.setCpfCnpj(cpf);
        c.setEmail(email);
        return c;
    }

    @Test
    void testRegisterCliente_Success() {
        Cliente cliente = buildCliente("João", "12345678900", "joao@email.com", "Fortaleza");

        when(clienteRepository.existsByCpfCnpj(cliente.getCpfCnpj())).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

        ClienteDto dto = new ClienteDto(cliente);
        Cliente result = clienteService.registerCliente(dto);

        assertEquals("João", result.getNome());
        verify(clienteRepository).save(any());
    }


}
