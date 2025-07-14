package br.com.papillon.eventos;

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
}
