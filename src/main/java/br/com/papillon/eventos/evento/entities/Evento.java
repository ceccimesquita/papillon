package br.com.papillon.eventos.evento.entities;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

import br.com.papillon.eventos.insumos.entities.Insumo;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "evento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 150)
    @NotBlank
    private String nome;

    @Size(max = 150)
    @NotBlank
    private String contratante;

    @NonNull
    private LocalDate data;

    @NonNull
    private BigDecimal valor;

    private BigDecimal gastos;

    private BigDecimal lucro;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Insumo> insumos;



    public Evento(EventoCreateDto dto) {
        this.nome = dto.nome();
        this.contratante = dto.contratante();
        this.data = dto.data();
        this.valor = dto.valor();
    }
}
