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

    @Test
    void testRegisterCliente_AlreadyExists() {
        Cliente cliente = buildCliente("Maria", "99999999999", "maria@email.com", "Sobral");

        when(clienteRepository.existsByCpfCnpj(cliente.getCpfCnpj())).thenReturn(true);

        ClienteDto dto = new ClienteDto(cliente);
        assertThrows(ClienteAlreadyExistsException.class, () -> clienteService.registerCliente(dto));
    }

    @Test
    void testListAllClientes() {
        Cliente c1 = buildCliente("Ana", "11111111111", "ana@email.com", "Juazeiro");
        Cliente c2 = buildCliente("Pedro", "22222222222", "pedro@email.com", "Crato");

        when(clienteRepository.findAll()).thenReturn(List.of(c1, c2));

        List<ClienteDto> resultado = clienteService.listAllClientes();

        assertEquals(2, resultado.size());
        assertEquals("Ana", resultado.get(0).nome());
        assertEquals("Pedro", resultado.get(1).nome());
    }

    @Test
    void testGetClienteById_Found() {
        Cliente cliente = buildCliente("Carlos", "33333333333", "carlos@email.com", "Fortaleza");
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        ClienteDto dto = clienteService.getClienteById(1L);

        assertEquals("Carlos", dto.nome());
    }

    @Test
    void testGetClienteById_NotFound() {
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ClienteNotFoundException.class, () -> clienteService.getClienteById(99L));
    }

    @Test
    void testGetClienteDetailsById() {
        Cliente cliente = buildCliente("Laura", "44444444444", "laura@email.com", "Icó");
        List<EventoSimpleDto> eventos = List.of(
                new EventoSimpleDto(1L, "Aniversário", LocalDate.of(2025, 7, 20), "Salão X")
        );

        when(clienteRepository.findById(2L)).thenReturn(Optional.of(cliente));
        when(eventoService.getEventosSimplesByClienteId(2L)).thenReturn(eventos);

        ClienteDetailsDto detalhes = clienteService.getClienteDetailsById(2L);

        assertEquals("Laura", detalhes.nome());
        assertEquals(1, detalhes.eventos().size());
        assertEquals("Aniversário", detalhes.eventos().get(0).nome());
    }

    @Test
    void testUpdateClienteById() {
        Cliente clienteExistente = buildCliente("Velho Nome", "55555555555", "velho@email.com", "Tauá");
        clienteExistente.setId(10L);

        Cliente clienteNovo = buildCliente("Novo Nome", "55555555555", "novo@email.com", "Tauá");
        clienteNovo.setId(10L);

        when(clienteRepository.findById(10L)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.save(any())).thenReturn(clienteNovo);

        ClienteDto dto = new ClienteDto(clienteNovo);
        ClienteDto atualizado = clienteService.updateClienteById(10L, dto);

        assertEquals("Novo Nome", atualizado.nome());
    }

    @Test
    void testDeleteClienteById_Success() {
        when(clienteRepository.existsById(8L)).thenReturn(true);

        clienteService.deleteClienteById(8L);

        verify(clienteRepository).deleteById(8L);
    }

    @Test
    void testDeleteClienteById_NotFound() {
        when(clienteRepository.existsById(123L)).thenReturn(false);

        assertThrows(ClienteNotFoundException.class, () -> clienteService.deleteClienteById(123L));
    }

    @Test
    void testGetByCpfCnpjOrCreate_Found() {
        Cliente existente = buildCliente("Existente", "66666666666", "existente@email.com", "Caucaia");
        when(clienteRepository.findByCpfCnpj("66666666666")).thenReturn(Optional.of(existente));

        ClienteDto dto = new ClienteDto(existente);
        Cliente resultado = clienteService.getByCpfCnpjOrCreate(dto);

        assertEquals("Existente", resultado.getNome());
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void testGetByCpfCnpjOrCreate_CreateNew() {
        Cliente novo = buildCliente("Novo", "77777777777", "novo@email.com", "Horizonte");
        when(clienteRepository.findByCpfCnpj("77777777777")).thenReturn(Optional.empty());
        when(clienteRepository.save(any())).thenReturn(novo);

        ClienteDto dto = new ClienteDto(novo);
        Cliente resultado = clienteService.getByCpfCnpjOrCreate(dto);

        assertEquals("Novo", resultado.getNome());
        verify(clienteRepository).save(any());
    }
}
