package br.com.papillon.eventos.cardapios.dtos;

import java.util.List;

import br.com.papillon.eventos.cardapios.entities.Item;
import jakarta.validation.constraints.NotBlank;

public record CardapioCreateDto(
    @NotBlank String nome,
    List<Item> itens
) {}
