package br.com.papillon.eventos.funcionario.entities;

import java.math.BigDecimal;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "funcionarios")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Funcionario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    private String nome;

    @NotBlank @Size(max = 100)
    private String funcao;

    @NotNull
    private BigDecimal valor;

    public Funcionario(FuncionarioDto dto) {
        this.nome            = dto.nome();
        this.funcao          = dto.funcao();
        this.valor           = dto.valor();
    }

    public Funcionario(Funcionario outro) {
        this.nome = outro.getNome();
        this.funcao = outro.getFuncao();
        this.valor = outro.getValor();
    }

}
