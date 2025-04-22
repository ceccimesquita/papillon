package br.com.papillon.eventos.insumos.entities;


import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;

@Entity
@Table(name = "insumo")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private BigDecimal preco;

    @Column(nullable = false)
    private String metodoPagamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    @JsonBackReference
    private Evento evento;


    public Insumo(InsumoDto dto, Evento evento) {
        this.nome = dto.nome();
        this.quantidade = dto.quantidade();
        this.preco = dto.preco();
        this.metodoPagamento = dto.metodoPagamento();
        this.evento = evento;
    }
}
