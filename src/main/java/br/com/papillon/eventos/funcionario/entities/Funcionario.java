package br.com.papillon.eventos.funcionario.entities;

import java.math.BigDecimal;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import br.com.papillon.eventos.evento.entities.Evento;

@Entity
@Table(name = "funcionarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 100)
    @NotBlank
    private String nome;

    @Size(max = 100)
    @NotBlank
    private String funcao;

    @NotNull
    private BigDecimal valor;

    @Size(max = 50)
    @NotBlank
    private String metodoPagamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id")
    private Evento evento;

    // em br.com.papillon.eventos.funcionario.entities.Funcionario
    public Funcionario(FuncionarioDto dto) {
        this.nome = dto.nome();
        this.funcao = dto.funcao();
        this.valor = dto.valor();
        this.metodoPagamento = dto.metodoPagamento();
        // não vinculamos orcamento aqui, pois o funcionário está ligado ao evento
    }

}
