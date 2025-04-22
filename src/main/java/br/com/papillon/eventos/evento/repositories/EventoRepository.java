package br.com.papillon.eventos.evento.repositories;

import br.com.papillon.eventos.evento.entities.Evento;
import org.springframework.data.jpa.repository.JpaRepository;


public interface EventoRepository extends JpaRepository<Evento, Long> {

}
