package br.com.papillon.eventos.evento.services;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.insumos.entities.Insumo;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EventoCalculadora {

    public void calcularGastosELucro(Evento evento) {
        BigDecimal totalGastos = BigDecimal.ZERO;

        if (evento.getInsumos() != null) {
            for (Insumo insumo : evento.getInsumos()) {
                if (insumo.getPreco() != null) {
                    totalGastos = totalGastos.add(insumo.getPreco());
                }
            }
        }

        evento.setGastos(totalGastos);
        evento.setLucro(evento.getValor().subtract(totalGastos));
    }
}
