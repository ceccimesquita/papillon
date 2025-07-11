// br.com.papillon.eventos.orcamento/repositories/OrcamentoRepository.java
package br.com.papillon.eventos.orcamento.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.papillon.eventos.orcamento.entities.Orcamento;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
}
