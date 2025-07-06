// para mostrar tudo (inclui listas de insumos e funcionários)
package br.com.papillon.eventos.evento.dtos;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.evento.entities.Evento;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EventoShowDto(
        Long id,
        String nome,
        ClienteDto cliente,
        LocalDate data,
        BigDecimal valor,
        BigDecimal gastos,
        BigDecimal lucro,
        List<InsumoDto> insumos,
        List<FuncionarioDto> funcionarios
) {
    public EventoShowDto(Evento e) {
        this(
                e.getId(),
                e.getNome(),
                new ClienteDto(e.getCliente()),
                e.getData(),
                e.getValor(),
                e.getGastos(),
                e.getLucro(),
                e.getInsumos().stream().map(InsumoDto::new).toList(),
                e.getFuncionarios().stream().map(FuncionarioDto::new).toList()
        );
    }
}
