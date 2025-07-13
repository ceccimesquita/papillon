package br.com.papillon.eventos.cardapios.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import br.com.papillon.eventos.cardapios.dtos.CardapioCreateDto;
import br.com.papillon.eventos.cardapios.dtos.CardapioDto;
import br.com.papillon.eventos.cardapios.services.CardapioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cardapios")
public class CardapioController {

    @Autowired
    private CardapioService cardapioService;

    @PostMapping
    public CardapioDto create(@RequestBody @Valid CardapioCreateDto dto) {
        return cardapioService.create(dto);
    }

    @GetMapping
    public List<CardapioDto> listAll() {
        return cardapioService.listAll();
    }

    @GetMapping("/{id}")
    public CardapioDto getById(@PathVariable Long id) {
        return cardapioService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        cardapioService.deleteById(id);
    }
}
