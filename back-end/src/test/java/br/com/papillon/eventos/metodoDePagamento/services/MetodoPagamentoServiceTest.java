package br.com.papillon.eventos.metodoDePagamento.services;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MetodoPagamentoServiceTest {

    @InjectMocks
    private MetodoPagamentoService metodoPagamentoService;

    @Mock
    private MetodoPagamentoRepository pagamentoRepository;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_deveSalvarENomeCorretamente() {
        MetodoPagamentoDto dto = new MetodoPagamentoDto(1L, "Pix", BigDecimal.TEN, LocalDate.now());
        MetodoPagamento mp = new MetodoPagamento(dto);

        when(pagamentoRepository.save(any())).thenReturn(mp);

        MetodoPagamentoDto resultado = metodoPagamentoService.create(dto);

        assertNotNull(resultado);
        assertEquals("Pix", resultado.nome());
        verify(pagamentoRepository).save(any());
    }
}
