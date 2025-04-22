package br.com.papillon.eventos.evento.dtos;

import br.com.papillon.eventos.evento.entities.Evento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EventoCreateDto(
        String nome,
        String contratante,
        LocalDate data,
        BigDecimal valor
) {
    public EventoCreateDto(Evento evento) {
        this(
                evento.getNome(),
                evento.getContratante(),
                evento.getData(),
                evento.getValor()
        );
    }
}
