package br.com.papillon.eventos.evento.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import br.com.papillon.eventos.evento.entities.Evento;

public record EventoCreateDto(
        @NotBlank @Size(max = 150) String nome,
        @NotNull Long clienteId,
        @NotNull LocalDate data,
        @NotNull BigDecimal valor
) {
    // Construtor inverso, para mapear entidade → DTO (se precisar)
    public EventoCreateDto(Evento evento) {
        this(
                evento.getNome(),
                evento.getCliente().getId(),
                evento.getData(),
                evento.getValor()
        );
    }
}

