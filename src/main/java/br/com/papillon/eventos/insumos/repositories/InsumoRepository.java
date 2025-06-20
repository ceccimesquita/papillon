package br.com.papillon.eventos.insumos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.papillon.eventos.insumos.entities.Insumo;

public interface InsumoRepository extends JpaRepository<Insumo, Long> {
}
