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

public record OrcamentoShowDto(
        Long id,
        ClienteDto cliente,
        LocalDate dataDoEvento,
        Integer quantidadePessoas,
        BigDecimal valorPorPessoa,
        BigDecimal valorTotal,
        LocalDate dataGeracao,
        LocalDate dataLimite,
        String status

) {
    public OrcamentoShowDto(Orcamento o) {
        this(
                o.getId(),
                new ClienteDto(o.getCliente()),
                o.getDataDoEvento(),
                o.getQuantidadePessoas(),
                o.getValorPorPessoa(),
                o.getValorTotal(),
                o.getDataGeracao(),
                o.getDataLimite(),
                o.getStatus().name()
//                o.getCardapios().stream().map(CardapioDto::new).toList(),
//                o.getFuncionarios().stream().map(FuncionarioDto::new).toList()
        );
    }
}
