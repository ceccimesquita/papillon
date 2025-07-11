package br.com.papillon.eventos.funcionario.dtos;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

public record FuncionarioDto(
        Long id,

        @NotBlank @Size(max = 100)
        String nome,

        @NotBlank @Size(max = 100)
        String funcao,

        @NotNull
        BigDecimal valor,

        @NotNull
        MetodoPagamentoDto metodoPagamento,

        @NotNull
        Long eventoId
) {
    public FuncionarioDto(Funcionario f) {
        this(
                f.getId(),
                f.getNome(),
                f.getFuncao(),
                f.getValor(),
                new MetodoPagamentoDto(f.getMetodoPagamento()),
                f.getEvento().getId()
        );
    }
}
