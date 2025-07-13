    package br.com.papillon.eventos.metodoDePagamento.dtos;

    import java.math.BigDecimal;
    import java.time.LocalDate;

    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.NotNull;
    import jakarta.validation.constraints.Size;

    import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;

    public record MetodoPagamentoDto(
            Long id,

            @NotBlank
            @Size(max = 100)
            String nome,

            @NotNull
            BigDecimal valor,

            @NotNull
            LocalDate data

    ) {
        public MetodoPagamentoDto(MetodoPagamento mp) {
            this(
                    mp.getId(),
                    mp.getNome(),
                    mp.getValor(),
                    mp.getData()
            );
        }
    }
