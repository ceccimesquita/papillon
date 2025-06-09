package br.com.papillon.eventos.orcamento.entities;

import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import br.com.papillon.eventos.cliente.entities.Cliente;
//import br.com.papillon.eventos.cardapio.entities.Cardapio;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.orcamento.dtos.OrcamentoDto;
import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;

@Entity
@Table(name = "orcamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @NotNull
    private LocalDate dataDoEvento;

    @NotNull
    private Integer quantidadePessoas;

    @NotNull
    private BigDecimal valorPorPessoa;

    @NotNull
    private BigDecimal valorTotal;

    /*@ManyToMany
    @JoinTable(
            name = "orcamento_cardapios",
            joinColumns = @JoinColumn(name = "orcamento_id"),
            inverseJoinColumns = @JoinColumn(name = "cardapio_id")
    )
    private Set<Cardapio> cardapios;*/


    @OneToMany(
            mappedBy = "orcamento",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Funcionario> funcionarios;


    @NotNull
    private Boolean isEvento;

    public Orcamento(OrcamentoDto dto) {
        this.cliente = new Cliente(dto.cliente());
        this.dataDoEvento = dto.dataDoEvento();
        this.quantidadePessoas = dto.quantidadePessoas();
        this.valorPorPessoa = dto.valorPorPessoa();
        this.valorTotal = dto.valorTotal();
        //this.cardapios = dto.cardapios();
        this.funcionarios = dto.funcionarios().stream()
                .map(Funcionario::new)                     // usa o construtor acima
                .collect(Collectors.toList());
        this.isEvento = dto.isEvento();
    }
}
