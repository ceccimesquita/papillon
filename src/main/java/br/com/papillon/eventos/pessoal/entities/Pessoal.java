package br.com.papillon.eventos.pessoal.entities;

import br.com.papillon.eventos.evento.entities.Evento;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class Pessoal {
    // Relacionamento com Evento (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;
}
