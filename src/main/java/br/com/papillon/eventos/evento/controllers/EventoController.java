package br.com.papillon.eventos.evento.controllers;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.services.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @PostMapping
    public ResponseEntity<Evento> createEvento(@RequestBody EventoCreateDto eventoDto) {
        Evento evento = eventoService.createEvento(eventoDto);
        return new ResponseEntity<>(evento, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventoShowDto>> listarTodos() {
        List<EventoShowDto> eventos = eventoService.listarTodos();
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoShowDto> getEventoById(@PathVariable Long id) {
        EventoShowDto evento = eventoService.getEventoById(id);
        return ResponseEntity.ok(evento); // Retorna o evento encontrado com código 200 (OK)
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoCreateDto> updateEvento(@PathVariable Long id, @RequestBody EventoCreateDto eventoDto) {
        EventoCreateDto eventoAtualizado = eventoService.updateEvento(id, eventoDto);
        return ResponseEntity.ok(eventoAtualizado); // Retorna o evento atualizado com código 200 (OK)
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable Long id) {
        eventoService.deleteEvento(id); // Chama o serviço para deletar o evento
        return ResponseEntity.noContent().build(); // Retorna um código 204 (No Content) indicando sucesso na exclusão
    }
}
