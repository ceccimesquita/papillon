package br.com.papillon.eventos.funcionario.dtos;

import java.math.BigDecimal;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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

        @NotNull
        MetodoPagamentoDto metodoPagamento,

        @NotNull
        Long eventoId
) {
    public FuncionarioDto(Funcionario funcionario) {
        this(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getFuncao(),
                funcionario.getValor(),
                new MetodoPagamentoDto(funcionario.getMetodoPagamento()),
                funcionario.getEvento().getId()
        );
    }
}
