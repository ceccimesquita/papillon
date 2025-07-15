package br.com.papillon.eventos.insumos.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.services.InsumoService;

@RestController
@RequestMapping("/api/insumo")
public class InsumoController {

    @Autowired
    private InsumoService insumoService;

    @Autowired
    private EventoRepository eventoRepository;

    // Criar novo insumo
    // Controller
    @PostMapping
    public ResponseEntity<InsumoDto> createInsumo(@RequestBody @Valid InsumoDto dto) {
        Insumo criado = insumoService.createInsumo(dto);
        Evento evento = eventoRepository.findById(dto.eventoId()).orElseThrow(null);
        evento.setGastos(evento.getGastos().add(dto.valor()));
        evento.setLucro(evento.getValor().subtract(evento.getGastos()));
        eventoRepository.save(evento);
        return ResponseEntity.ok(new InsumoDto(criado));
    }

    // Listar todos os insumos
    @GetMapping
    public ResponseEntity<List<InsumoDto>> listAllInsumos() {
        List<InsumoDto> lista = insumoService.listAllInsumos();
        return ResponseEntity.ok(lista);
    }

    // Obter insumo por ID
    @GetMapping("/{id}")
    public ResponseEntity<InsumoDto> getInsumoById(@PathVariable Long id) {
        InsumoDto dto = insumoService.getInsumoById(id);
        return ResponseEntity.ok(dto);
    }

    // Excluir insumo por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsumoById(@PathVariable Long id) {
        insumoService.deleteInsumoById(id);
        return ResponseEntity.noContent().build();
    }

}
