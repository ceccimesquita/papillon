package br.com.papillon.eventos.cardapios.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CardapioCreateDto(
    @NotBlank String nome,
    @NotBlank String tipo,
    @NotNull Long orcamentoId
) {}
