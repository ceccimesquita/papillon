package br.com.papillon.eventos.funcionario.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

import br.com.papillon.eventos.funcionario.entities.Funcionario;

public record FuncionarioDto(
        Long id,

        @NotBlank
        @Size(max = 100)
        String nome,

        @NotBlank
        @Size(max = 100)
        String funcao,

        @NotNull
        BigDecimal valor,

        @NotBlank
        @Size(max = 50)
        String metodoPagamento

) {
    public FuncionarioDto(Funcionario funcionario) {
        this(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getFuncao(),
                funcionario.getValor(),
                funcionario.getMetodoPagamento()
        );
    }
}
