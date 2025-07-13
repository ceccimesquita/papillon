package br.com.papillon.eventos.cardapios.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.papillon.eventos.cardapios.entities.Cardapio;

public interface CardapioRepository extends JpaRepository<Cardapio, Long> {
}
