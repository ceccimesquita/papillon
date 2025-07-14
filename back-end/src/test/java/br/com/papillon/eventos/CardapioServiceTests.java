package br.com.papillon.eventos.cardapios;

import br.com.papillon.eventos.cardapios.dtos.CardapioCreateDto;
import br.com.papillon.eventos.cardapios.dtos.CardapioDto;
import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cardapios.exceptions.CardapioNotFoundException;
import br.com.papillon.eventos.cardapios.repositories.CardapioRepository;
import br.com.papillon.eventos.cardapios.services.CardapioService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CardapioServiceTests {

    @InjectMocks
    private CardapioService cardapioService;

    @Mock
    private CardapioRepository cardapioRepository;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateCardapio() {
        CardapioCreateDto dto = new CardapioCreateDto("Almoço", new ArrayList<>());

        Cardapio entity = Cardapio.builder()
            .nome(dto.nome())
            .itens(dto.itens())
            .build();

        when(cardapioRepository.save(any())).thenReturn(entity);

        CardapioDto result = cardapioService.create(dto);

        assertEquals("Almoço", result.nome());
        verify(cardapioRepository, times(1)).save(any(Cardapio.class));
    }

    @Test
    void testListAll() {
        Cardapio c1 = Cardapio.builder().nome("Café").itens(new ArrayList<>()).build();
        Cardapio c2 = Cardapio.builder().nome("Jantar").itens(new ArrayList<>()).build();
        when(cardapioRepository.findAll()).thenReturn(List.of(c1, c2));

        List<CardapioDto> lista = cardapioService.listAll();

        assertEquals(2, lista.size());
        assertEquals("Café", lista.get(0).nome());
        assertEquals("Jantar", lista.get(1).nome());
    }
}
