package br.com.papillon.eventos.orcamento.dtos;

import java.util.List;
import java.math.BigDecimal;
import java.sql.Timestamp;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import br.com.papillon.eventos.orcamento.entities.OrcamentoStatus;

public record OrcamentoShowDto(
        Long id,
        ClienteDto cliente,
        long dataDoEvento,
        Integer quantidadePessoas,
        BigDecimal valorPorPessoa,
        BigDecimal valorTotal,
        long dataGeracao,
        long dataLimite,
        String status,
        List<Funcionario> funcionarios,
        List<Cardapio> cardapios
) {
    public OrcamentoShowDto(Orcamento o) {
        this(
                o.getId(),
                new ClienteDto(o.getCliente()),
                Timestamp.valueOf(o.getDataDoEvento().atStartOfDay()).getTime(),
                o.getQuantidadePessoas(),
                o.getValorPorPessoa(),
                o.getValorTotal(),
                Timestamp.valueOf(o.getDataGeracao().atStartOfDay()).getTime(),
                Timestamp.valueOf(o.getDataLimite().atStartOfDay()).getTime(),
                o.getStatus().name(),
                o.getFuncionarios(),
                o.getCardapios()
        );
    }
}