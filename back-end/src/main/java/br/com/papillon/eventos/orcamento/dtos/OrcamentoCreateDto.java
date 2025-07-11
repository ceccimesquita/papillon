package br.com.papillon.eventos.orcamento.dtos;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OrcamentoCreateDto(
        Long clienteId,
        @Valid ClienteDto novoCliente,   // opcional, só preenche se for um cliente novo
        @NotNull LocalDate dataDoEvento,
        @NotNull Integer quantidadePessoas,
        @NotNull BigDecimal valorPorPessoa,
        @NotNull LocalDate dataLimite
) {
    @AssertTrue(message = "Informe clienteId ou dados do novo cliente")
    public boolean isClienteInfoValida() {
        return (clienteId != null) ^ (novoCliente != null);
    }
}


