package br.com.papillon.eventos.orcamento;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.cliente.services.ClienteService;
import br.com.papillon.eventos.evento.services.EventoService;
import br.com.papillon.eventos.orcamento.dtos.OrcamentoCreateDto;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import br.com.papillon.eventos.orcamento.entities.OrcamentoStatus;
import br.com.papillon.eventos.orcamento.exception.OrcamentoNotFoundException;
import br.com.papillon.eventos.orcamento.repositories.OrcamentoRepository;
import br.com.papillon.eventos.orcamento.services.OrcamentoService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class OrcamentoServiceTests {

    private OrcamentoRepository orcamentoRepository;
    private ClienteService clienteService;
    private EventoService eventoService;
    private ClienteRepository clienteRepository;

    private OrcamentoService orcamentoService;

    @BeforeEach
    void setUp() {
        orcamentoRepository = mock(OrcamentoRepository.class);
        clienteService = mock(ClienteService.class);
        eventoService = mock(EventoService.class);
        clienteRepository = mock(ClienteRepository.class);
        orcamentoService = new OrcamentoService(orcamentoRepository, clienteService, eventoService, clienteRepository);
    }

    private Cliente mockCliente() {
        Cliente c = new Cliente();
        c.setId(1L);
        c.setNome("João");
        c.setCpfCnpj("12345678900");
        c.setEmail("joao@email.com");
        c.setTelefone("88999999999");
        // c.setEndereco("Rua A");
        return c;
    }

    @Test
    void testCreateOrcamento() {
        ClienteDto clienteDto = new ClienteDto(1L, "João", "12345678900", "joao@email.com", "88999999999");
        OrcamentoCreateDto dto = new OrcamentoCreateDto(
                clienteDto,
                LocalDate.now().plusDays(10),
                100,
                new BigDecimal("50.00"),
                LocalDate.now().plusDays(5),
                null,
                null
        );

        Cliente cliente = mockCliente();

        when(clienteService.getByCpfCnpjOrCreate(dto.cliente())).thenReturn(cliente);
        when(orcamentoRepository.save(any(Orcamento.class))).thenAnswer(invocation -> {
            Orcamento saved = invocation.getArgument(0);
            saved.setId(1L);
            saved.setStatus(OrcamentoStatus.PENDENTE);
            return saved;
        });

        var result = orcamentoService.create(dto);

        assertNotNull(result);
        assertEquals(1L, result.id());
    }


    @Test
    void testListAll() {
        Orcamento o1 = new Orcamento();
        o1.setId(1L);
        o1.setCliente(mockCliente());
        o1.setStatus(OrcamentoStatus.PENDENTE);

        Orcamento o2 = new Orcamento();
        o2.setId(2L);
        o2.setCliente(mockCliente());
        o2.setStatus(OrcamentoStatus.PENDENTE);

        when(orcamentoRepository.findAll()).thenReturn(List.of(o1, o2));

        var result = orcamentoService.listAll();

        assertEquals(2, result.size());
    }
}
