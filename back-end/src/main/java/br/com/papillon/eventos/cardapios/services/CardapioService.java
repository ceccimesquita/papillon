package br.com.papillon.eventos.cardapios.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.cardapios.dtos.CardapioCreateDto;
import br.com.papillon.eventos.cardapios.dtos.CardapioDto;
import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cardapios.exceptions.CardapioNotFoundException;
import br.com.papillon.eventos.cardapios.repositories.CardapioRepository;

@Service
public class CardapioService {

    @Autowired
    private CardapioRepository cardapioRepo;

    public CardapioDto create(CardapioCreateDto dto) {
        Cardapio novo = Cardapio.builder()
            .nome(dto.nome())
            .itens(dto.itens()) // você deve transformar os itens do DTO em entidades e associar aqui
            .build();

        cardapioRepo.save(novo);
        return new CardapioDto(novo);
    }

    public List<CardapioDto> listAll() {
        return cardapioRepo.findAll().stream()
            .map(CardapioDto::new)
            .toList();
    }

    public CardapioDto getById(Long id) {
        Cardapio c = cardapioRepo.findById(id)
            .orElseThrow(() -> new CardapioNotFoundException(id));
        return new CardapioDto(c);
    }

    public void deleteById(Long id) {
        if (!cardapioRepo.existsById(id)) {
            throw new CardapioNotFoundException(id);
        }
        cardapioRepo.deleteById(id);
    }
}
