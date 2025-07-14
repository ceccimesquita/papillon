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
    @Test
    void getById_quandoExiste_deveRetornarDto() {
        MetodoPagamento pagamento = new MetodoPagamento();
        pagamento.setId(1L);
        pagamento.setNome("Cartão");
        pagamento.setValor(BigDecimal.valueOf(50));
        pagamento.setData(LocalDate.now());

        when(pagamentoRepository.findById(1L)).thenReturn(Optional.of(pagamento));

        MetodoPagamentoDto dto = metodoPagamentoService.getById(1L);

        assertNotNull(dto);
        assertEquals("Cartão", dto.nome());
        assertEquals(BigDecimal.valueOf(50), dto.valor());
        verify(pagamentoRepository).findById(1L);
    }

    @Test
    void update_quandoExiste_deveAtualizarEPersistir() {
        Long id = 1L;
        MetodoPagamento existente = new MetodoPagamento();
        existente.setId(id);
        existente.setNome("Cartão");
        existente.setValor(BigDecimal.valueOf(100));
        existente.setData(LocalDate.of(2024, 1, 1));

        MetodoPagamentoDto dtoAtualizado = new MetodoPagamentoDto(
            id, "Pix", BigDecimal.valueOf(200), LocalDate.of(2025, 1, 1)
        );

        when(pagamentoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(pagamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        MetodoPagamentoDto resultado = metodoPagamentoService.update(id, dtoAtualizado);

        assertEquals(dtoAtualizado.nome(), resultado.nome());
        assertEquals(dtoAtualizado.valor(), resultado.valor());
        assertEquals(dtoAtualizado.data(), resultado.data());
        verify(pagamentoRepository, times(1)).save(existente);
    }
    @Test
    void delete_quandoExiste_deveRemoverMetodoPagamento() {
        Long id = 1L;

        when(pagamentoRepository.existsById(id)).thenReturn(true);
        doNothing().when(pagamentoRepository).deleteById(id);

        assertDoesNotThrow(() -> metodoPagamentoService.delete(id));
        verify(pagamentoRepository, times(1)).deleteById(id);
    }
    @Test
    void delete_quandoNaoExiste_deveLancarExcecao() {
        Long id = 99L;

        when(pagamentoRepository.existsById(id)).thenReturn(false);

        MetodoPagamentoNotFoundException exception = assertThrows(
            MetodoPagamentoNotFoundException.class,
            () -> metodoPagamentoService.delete(id)
        );

        assertEquals("Método de Pagamento com ID 99 não encontrado.", exception.getMessage());
        verify(pagamentoRepository, never()).deleteById(any());
    }

}
