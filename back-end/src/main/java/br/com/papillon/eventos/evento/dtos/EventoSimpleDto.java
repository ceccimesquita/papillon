// para mostrar tudo (inclui listas de insumos e funcionários)
package br.com.papillon.eventos.evento.dtos;

import br.com.papillon.eventos.evento.entities.Evento;
import java.time.LocalDate;

public record EventoSimpleDto(
        Long id,
        String nome,
        LocalDate data,
        String status
) {
    public EventoSimpleDto(Evento e) {
        this(
                e.getId(),
                e.getNome(),
                e.getData(),
                e.getStatus()
            );
    }
}
