package br.com.papillon.eventos.evento.repositories;

import br.com.papillon.eventos.evento.entities.Evento;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    Optional<Evento> findByClienteId(Long clienteId);
    List<Evento> findAllByOrderByDataDesc();
}