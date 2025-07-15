package br.com.papillon.eventos.orcamento.entities;

import br.com.papillon.eventos.orcamento.dtos.OrcamentoCreateDto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

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

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "orcamento_id", nullable = true) 
    private List<Cardapio> cardapios;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "orcamento_id", nullable = true)
    private List<Funcionario> funcionarios;

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
    ) {
        this.cliente = cliente;
        this.dataDoEvento = dto.dataDoEvento();
        this.quantidadePessoas = dto.quantidadePessoas();
        this.valorPorPessoa = dto.valorPorPessoa();
        this.dataLimite = dto.dataLimite();
        this.cardapios = dto.cardapios();
        this.funcionarios = dto.funcionarios();
        this.status = OrcamentoStatus.PENDENTE;
        calcularTotal();
    }
}