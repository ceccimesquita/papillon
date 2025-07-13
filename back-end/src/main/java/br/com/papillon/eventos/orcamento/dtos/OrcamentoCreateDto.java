package br.com.papillon.eventos.orcamento.dtos;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;

public record OrcamentoCreateDto(
        @Valid ClienteDto cliente,
        @NotNull LocalDate dataDoEvento,
        @NotNull Integer quantidadePessoas,
        @NotNull BigDecimal valorPorPessoa,
        @NotNull LocalDate dataLimite,
        List<Cardapio> cardapios,
        List<Funcionario> funcionarios
) {
}


