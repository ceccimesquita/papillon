package br.com.papillon.eventos.evento.dtos;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.evento.entities.Evento;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public record EventoShowDto(
        Long id,
        String nome,
        ClienteDto cliente,
        long data,
        BigDecimal valor,
        BigDecimal gastos,
        BigDecimal lucro,
        List<InsumoDto> insumos
) {
    public EventoShowDto(Evento e) {
        this(
                e.getId(),
                e.getNome(),
                new ClienteDto(e.getCliente()),
                Timestamp.valueOf(e.getData().atStartOfDay()).getTime(),
                e.getValor(),
                e.getGastos(),
                e.getLucro(),
                e.getInsumos().stream().map(InsumoDto::new).toList()
        );
    }
}