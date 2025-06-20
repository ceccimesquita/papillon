package br.com.papillon.eventos.evento.dtos;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;



@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventoShowDto {
    private Long id;
    private String nome;
    private String contratante;
    private LocalDate data;
    private BigDecimal valor;
    private BigDecimal gastos;
    private BigDecimal lucro;
    private List<InsumoDto> insumos;


    public EventoShowDto(Evento evento, List<br.com.papillon.eventos.insumos.entities.Insumo> insumos) {
        this.id = evento.getId();
        this.nome = evento.getNome();
        this.contratante = evento.getContratante();
        this.data = evento.getData();
        this.valor = evento.getValor();
        this.gastos = evento.getGastos();
        this.lucro = evento.getLucro();
        this.insumos = insumos != null
                ? insumos.stream().map(insumo -> new InsumoDto(insumo)).collect(Collectors.toList())
                : null;
    }
}
