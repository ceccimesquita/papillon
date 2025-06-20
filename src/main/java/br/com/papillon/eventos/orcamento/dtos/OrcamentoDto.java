package br.com.papillon.eventos.orcamento.dtos;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.constraints.NotNull;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
//import br.com.papillon.eventos.cardapio.dtos.CardapioDto;
import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.orcamento.entities.Orcamento;

public record OrcamentoDto(
        @NotNull ClienteDto cliente,
        @NotNull LocalDate dataDoEvento,
        @NotNull Integer quantidadePessoas,
        @NotNull BigDecimal valorPorPessoa,
        @NotNull BigDecimal valorTotal,
        //Set<CardapioDto> cardapios,
        //List<FuncionarioDto> funcionarios,
        @NotNull Boolean isEvento
) {
    public OrcamentoDto(Orcamento orcamento) {
        this(
                new ClienteDto(orcamento.getCliente()),
                orcamento.getDataDoEvento(),
                orcamento.getQuantidadePessoas(),
                orcamento.getValorPorPessoa(),
                orcamento.getValorTotal(),
                //orcamento.getCardapios().stream().map(CardapioDto::new).collect(Collectors.toSet()),
                //orcamento.getFuncionarios().stream()
                  //      .map(FuncionarioDto::new)
                    //    .collect(Collectors.toList()),
                orcamento.getIsEvento()
        );
    }
}
