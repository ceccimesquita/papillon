package br.com.papillon.eventos.orcamento.dtos;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
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
        String status,
        List<Funcionario> funcionarios,
        List<Cardapio> cardapios
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
                o.getStatus().name(),
                o.getFuncionarios(),
                o.getCardapios()
        );
    }
}
