package br.com.papillon.eventos.insumos.repositories;

import br.com.papillon.eventos.insumos.entities.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    List<Insumo> findByEventoId(Long eventoId);
    // Aqui você pode adicionar métodos customizados se necessário
}
