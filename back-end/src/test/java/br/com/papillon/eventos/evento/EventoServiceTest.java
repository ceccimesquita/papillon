package br.com.papillon.eventos.evento;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import br.com.papillon.eventos.evento.services.EventoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import java.util.Collections;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.dtos.EventoSimpleDto;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.exception.EventoNotFoundException;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import br.com.papillon.eventos.orcamento.entities.Orcamento;

@ExtendWith(MockitoExtension.class)
class EventoServiceTest {

    @Mock
    private EventoRepository eventoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private EventoService service;

    private Cliente clienteMock;
    private Evento eventoMock;

    @BeforeEach
    void setup() {
        clienteMock = new Cliente();
        clienteMock.setId(1L);
        clienteMock.setNome("Cliente Teste");

        eventoMock = new Evento();
        eventoMock.setId(10L);
        eventoMock.setCliente(clienteMock);
        eventoMock.setData(LocalDate.of(2025, 7, 20));
        eventoMock.setValor(BigDecimal.valueOf(500));
        eventoMock.setGastos(BigDecimal.ZERO);
        eventoMock.setLucro(BigDecimal.ZERO);
    }

    @Test
    void createEvento_sucesso() {
        EventoCreateDto dto = new EventoCreateDto(
                "Evento X", clienteMock.getId(), eventoMock.getData(), eventoMock.getValor(), "Em andamento"
        );
        when(clienteRepository.findById(dto.clienteId()))
                .thenReturn(Optional.of(clienteMock));
        when(eventoRepository.save(any(Evento.class)))
                .thenReturn(eventoMock);

        EventoShowDto resultado = service.createEvento(dto);

        verify(eventoRepository).save(any(Evento.class));
        assertThat(resultado.id()).isEqualTo(eventoMock.getId());
        // aqui usamos cliente().id() em vez de clienteId()
        assertThat(resultado.cliente().id()).isEqualTo(clienteMock.getId());
    }

    @Test
    void createEvento_clienteNaoEncontrado_lancaRuntimeException() {
        EventoCreateDto dto = new EventoCreateDto(
                "Evento Y", 999L, LocalDate.now(), BigDecimal.TEN, "Status"
        );
        when(clienteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createEvento(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cliente não encontrado");
    }

    @Test
    void getEventoById_sucesso() {
        when(eventoRepository.findById(eventoMock.getId()))
                .thenReturn(Optional.of(eventoMock));

        EventoShowDto dto = service.getEventoById(eventoMock.getId());

        assertThat(dto.id()).isEqualTo(eventoMock.getId());
        assertThat(dto.valor()).isEqualByComparingTo(eventoMock.getValor());
    }

    @Test
    void getEventoById_naoExiste_lancaEventoNotFoundException() {
        when(eventoRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getEventoById(42L))
                .isInstanceOf(EventoNotFoundException.class)
                .hasMessageContaining("42");
    }

    @Test
    void listAllEventos_retornaListaCorreta() {
        when(eventoRepository.findAll()).thenReturn(List.of(eventoMock));

        List<EventoShowDto> lista = service.listAllEventos();

        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).id()).isEqualTo(eventoMock.getId());
    }

    @Test
    void updateEvento_sucesso() {
        EventoCreateDto dto = new EventoCreateDto(
                "Novo Nome", clienteMock.getId(), eventoMock.getData(), BigDecimal.valueOf(1000), "Atualizado"
        );
        when(eventoRepository.findById(eventoMock.getId()))
                .thenReturn(Optional.of(eventoMock));
        when(clienteRepository.findById(clienteMock.getId()))
                .thenReturn(Optional.of(clienteMock));
        when(eventoRepository.save(eventoMock)).thenReturn(eventoMock);

        EventoShowDto atual = service.updateEvento(eventoMock.getId(), dto);

        verify(eventoRepository).save(eventoMock);
        assertThat(atual.nome()).isEqualTo("Novo Nome");
        assertThat(atual.valor()).isEqualByComparingTo(BigDecimal.valueOf(1000));
    }

    @Test
    void deleteEvento_sucesso() {
        when(eventoRepository.existsById(eventoMock.getId())).thenReturn(true);

        service.deleteEvento(eventoMock.getId());

        verify(eventoRepository).deleteById(eventoMock.getId());
    }

    @Test
    void deleteEvento_naoExiste_lancaEventoNotFoundException() {
        when(eventoRepository.existsById(5L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteEvento(5L))
                .isInstanceOf(EventoNotFoundException.class);
    }

    @Test
    void createFromOrcamento_sucesso() {
        Orcamento orc = mock(Orcamento.class);
        when(orc.getCliente()).thenReturn(clienteMock);
        when(orc.getDataDoEvento()).thenReturn(LocalDate.of(2025, 8, 1));
        when(orc.getValorTotal()).thenReturn(BigDecimal.valueOf(2000));
        when(orc.getFuncionarios()).thenReturn(List.of());
        when(orc.getCardapios()).thenReturn(List.of());
        when(eventoRepository.save(any(Evento.class))).thenReturn(eventoMock);

        EventoShowDto dto = service.createFromOrcamento(orc);

        // verifica que o cliente veio corretamente
        assertThat(dto.cliente().id()).isEqualTo(clienteMock.getId());
        // como você stubou save() para retornar eventoMock, o valor virá de eventoMock.getValor()
        assertThat(dto.valor()).isEqualByComparingTo(BigDecimal.valueOf(500));
    }

    @Test
    void listAllEventos_vazio_retornaListaVazia() {
        when(eventoRepository.findAll()).thenReturn(Collections.emptyList());

        List<EventoShowDto> lista = service.listAllEventos();

        assertThat(lista).isEmpty();
    }

    @Test
    void updateEvento_eventoNaoEncontrado_lancaEventoNotFoundException() {
        EventoCreateDto dto = new EventoCreateDto(
                "Qualquer", clienteMock.getId(), eventoMock.getData(), eventoMock.getValor(), "X"
        );
        when(eventoRepository.findById(123L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateEvento(123L, dto))
                .isInstanceOf(EventoNotFoundException.class)
                .hasMessageContaining("123");
    }

    @Test
    void updateEvento_clienteNaoEncontrado_lancaRuntimeException() {
        when(eventoRepository.findById(eventoMock.getId()))
                .thenReturn(Optional.of(eventoMock));
        when(clienteRepository.findById(999L)).thenReturn(Optional.empty());

        EventoCreateDto dto = new EventoCreateDto(
                "Novo", 999L, eventoMock.getData(), eventoMock.getValor(), "X"
        );

        assertThatThrownBy(() -> service.updateEvento(eventoMock.getId(), dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cliente não encontrado");
    }

    @Test
    void createFromOrcamento_clienteNull_lancaNullPointerException() {
        Orcamento orc = mock(Orcamento.class);
        when(orc.getCliente()).thenReturn(null);

        assertThatThrownBy(() -> service.createFromOrcamento(orc))
                .isInstanceOf(NullPointerException.class);
    }

}