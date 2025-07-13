package br.com.papillon.eventos.evento.controllers;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.services.EventoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evento")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @PostMapping
    public ResponseEntity<EventoShowDto> createEvento(
            @RequestBody @Valid EventoCreateDto eventoDto
    ) {
        EventoShowDto criado = eventoService.createEvento(eventoDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(criado);
    }
    // GET /api/eventos — lista todos os eventos
    @GetMapping
    public ResponseEntity<List<EventoShowDto>> listAllEventos() {
        List<EventoShowDto> lista = eventoService.listAllEventos();
        return ResponseEntity.ok(lista);
    }

    // GET /api/eventos/{id} — busca um evento por ID
    @GetMapping("/{id}")
    public ResponseEntity<EventoShowDto> getEventoById(@PathVariable Long id) {
        EventoShowDto dto = eventoService.getEventoById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoShowDto> updateEvento(
            @PathVariable Long id,
            @RequestBody EventoCreateDto dto
    ) {
        EventoShowDto atualizado = eventoService.updateEvento(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    // DELETE /api/eventos/{id} — exclui um evento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable Long id) {
        eventoService.deleteEvento(id);
        return ResponseEntity.noContent().build();
    }
}
