package br.com.papillon.eventos.metodoDePagamento.services;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.exceptions.MetodoPagamentoNotFoundException;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
    @Test
    void listAll_deveRetornarListaDeDtos() {
        MetodoPagamento mp1 = new MetodoPagamento();
        mp1.setId(1L);
        mp1.setNome("Cartão");
        mp1.setValor(BigDecimal.valueOf(100));
        mp1.setData(LocalDate.now());

        MetodoPagamento mp2 = new MetodoPagamento();
        mp2.setId(2L);
        mp2.setNome("Pix");
        mp2.setValor(BigDecimal.valueOf(200));
        mp2.setData(LocalDate.now());

        List<MetodoPagamento> lista = List.of(mp1, mp2);

        when(pagamentoRepository.findAll()).thenReturn(lista);

        List<MetodoPagamentoDto> resultado = metodoPagamentoService.listAll();

        assertEquals(2, resultado.size());
        assertEquals("Cartão", resultado.get(0).nome());
        assertEquals("Pix", resultado.get(1).nome());
        verify(pagamentoRepository).findAll();
    }
   
}
