package br.com.papillon.eventos.insumos.services;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.exceptions.InsumoNotFoundException;
import br.com.papillon.eventos.insumos.repositories.InsumoRepository;
import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InsumoServiceTest {

    @InjectMocks
    private InsumoService insumoService;

    @Mock
    private InsumoRepository insumoRepository;

    @Mock
    private MetodoPagamentoRepository metodoPagamentoRepository;

    @Mock
    private EventoRepository eventoRepository;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createInsumo_deveCriarNovoInsumo() {
        Evento evento = new Evento();
        when(eventoRepository.findById(1L)).thenReturn(Optional.of(evento));

        MetodoPagamentoDto mpDto = new MetodoPagamentoDto(1L, "Pix", BigDecimal.TEN, LocalDate.now());
        InsumoDto dto = new InsumoDto(1L, "Insumo Teste", BigDecimal.TEN, mpDto, 1L);

        Insumo insumo = new Insumo(dto, evento);

        when(insumoRepository.save(any())).thenReturn(insumo);

        Insumo criado = insumoService.createInsumo(dto);

        assertNotNull(criado);
        verify(insumoRepository, times(1)).save(any());
    }
    @Test
    void listAllInsumos_deveRetornarListaDeDtos() {
        MetodoPagamento mp = new MetodoPagamento();
        mp.setId(1L);
        mp.setNome("Cartão");
        mp.setValor(BigDecimal.TEN);
        mp.setData(LocalDate.now());

        Evento evento = new Evento();
        evento.setId(1L);

        Insumo insumo = new Insumo();
        insumo.setNome("Insumo 1");
        insumo.setValor(BigDecimal.TEN);
        insumo.setMetodoPagamento(mp);
        insumo.setEvento(evento);

        when(insumoRepository.findAll()).thenReturn(List.of(insumo));

        List<InsumoDto> resultado = insumoService.listAllInsumos();

        assertEquals(1, resultado.size());
        assertEquals("Insumo 1", resultado.get(0).nome());
        verify(insumoRepository).findAll();
    }

    @Test
    void getInsumoById_quandoExiste_deveRetornarDto() {
        MetodoPagamento mp = new MetodoPagamento();
        mp.setId(1L);
        mp.setNome("Pix");
        mp.setValor(BigDecimal.TEN);
        mp.setData(LocalDate.now());

        Evento evento = new Evento();
        evento.setId(1L);

        Insumo insumo = new Insumo();
        insumo.setId(10L);
        insumo.setNome("Insumo Teste");
        insumo.setValor(BigDecimal.TEN);
        insumo.setMetodoPagamento(mp);
        insumo.setEvento(evento);

        when(insumoRepository.findById(10L)).thenReturn(Optional.of(insumo));

        InsumoDto dto = insumoService.getInsumoById(10L);

        assertNotNull(dto);
        assertEquals("Insumo Teste", dto.nome());
        assertEquals("Pix", dto.metodoPagamento().nome());
        assertEquals(BigDecimal.TEN, dto.metodoPagamento().valor());
    }


}