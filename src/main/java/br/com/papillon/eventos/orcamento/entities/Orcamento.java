package br.com.papillon.eventos.orcamento.entities;

import br.com.papillon.eventos.orcamento.dtos.OrcamentoCreateDto;
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

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;

@Entity
@Table(name = "orcamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
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

//    @ManyToMany(fetch = FetchType.EAGER)
//    @JoinTable(
//            name = "orcamento_cardapio",
//            joinColumns = @JoinColumn(name = "orcamento_id"),
//            inverseJoinColumns = @JoinColumn(name = "cardapio_id")
//    )
//    private List<Cardapio> cardapios;
//
//    @OneToMany(mappedBy = "orcamento",
//            cascade = CascadeType.ALL,
//            orphanRemoval = true,
//            fetch = FetchType.EAGER)
//    private List<Funcionario> funcionarios;

    @Enumerated(EnumType.STRING)
    private OrcamentoStatus status;

    @NotNull
    private LocalDate dataGeracao;

    @NotNull
    private LocalDate dataLimite;

    @PrePersist
    private void prePersist() {
        this.dataGeracao = LocalDate.now();
        calcularTotal();
        if (this.status == null) {
            this.status = OrcamentoStatus.PENDENTE;
        }
    }

    @PreUpdate
    private void preUpdate() {
        calcularTotal();
    }

    private void calcularTotal() {
        if (valorPorPessoa != null && quantidadePessoas != null) {
            this.valorTotal = valorPorPessoa.multiply(BigDecimal.valueOf(quantidadePessoas));
        }
    }

    public Orcamento(OrcamentoCreateDto dto, Cliente cliente
//                     List<Cardapio> cardapios, List<Funcionario> funcionarios
    ) {
        this.cliente = cliente;
        this.dataDoEvento = dto.dataDoEvento();
        this.quantidadePessoas = dto.quantidadePessoas();
        this.valorPorPessoa = dto.valorPorPessoa();
        this.dataLimite = dto.dataLimite();
//        this.cardapios = cardapios;
//        this.funcionarios = funcionarios;
        this.status = OrcamentoStatus.PENDENTE;
        calcularTotal();
    }
}