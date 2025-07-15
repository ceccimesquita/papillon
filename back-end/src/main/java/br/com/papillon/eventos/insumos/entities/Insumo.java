package br.com.papillon.eventos.insumos.entities;

import java.math.BigDecimal;

import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

import br.com.papillon.eventos.evento.entities.Evento;

@Entity
@Table(name = "insumos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    private String nome;

    @NotNull
    private BigDecimal valor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id")
    @JsonIgnoreProperties("insumos")
    private Evento evento;

    private String metodoPagamento;

    public Insumo(InsumoDto dto, Evento evento) {
        this.nome = dto.nome();
        this.valor = dto.valor();
        this.evento = evento;
        this.metodoPagamento = dto.metodoPagamento();
    }
}
