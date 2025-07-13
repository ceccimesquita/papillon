package br.com.papillon.eventos.metodoDePagamento.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;

public interface MetodoPagamentoRepository extends JpaRepository<MetodoPagamento, Long> {
}
