package br.com.papillon.eventos.evento.entities;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.insumos.entities.Insumo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @NotNull
    private LocalDate data;

    @NotNull
    private BigDecimal valor;

    private BigDecimal gastos;
    private BigDecimal lucro;

    private String status;

    private int qtdPessoas;

    @OneToMany(mappedBy = "evento",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER)
    @JsonIgnoreProperties("evento")
    private List<Insumo> insumos = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "evento_id", nullable = true) 
    private List<Cardapio> cardapios;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "evento_id", nullable = true)
    private List<Funcionario> funcionarios;

    // Construtor para criação a partir do DTO
    public Evento(EventoCreateDto dto, Cliente cliente) {
        this.nome     = dto.nome();
        this.cliente  = cliente;
        this.data     = dto.data();
        this.valor    = dto.valor();
        this.gastos   = BigDecimal.ZERO;
        this.lucro    = BigDecimal.ZERO;
        this.status   = dto.status(); 
        // insumos e funcionarios já instanciados como lista vazia
    }

//    @PrePersist @PreUpdate
//    private void recalcularFinanceiro() {
//        BigDecimal totalInsumos = insumos == null
//                ? BigDecimal.ZERO
//                : insumos.stream()
//                .map(Insumo::getValor)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        BigDecimal totalFuncionarios = funcionarios == null
//                ? BigDecimal.ZERO
//                : funcionarios.stream()
//                .map(Funcionario::getValor)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        this.gastos = totalInsumos.add(totalFuncionarios);
//        this.lucro  = this.valor.subtract(this.gastos);
//    }

    public void recalcularGastosELucro(Evento evento) {
        BigDecimal somaInsumos = evento.getInsumos().stream()
                .map(i -> i.getValor())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lucro = evento.getValor().subtract(gastos);

        evento.setGastos(gastos);
        evento.setLucro(lucro);
    }

}
