package br.com.papillon.eventos.metodoDePagamento.controllers;

import java.util.List;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.metodoDePagamento.services.MetodoPagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/pagamentos")
public class MetodoPagamentoController {

    @Autowired
    private MetodoPagamentoService pagamentoService;

    @PostMapping
    public ResponseEntity<MetodoPagamentoDto> create(@RequestBody @Valid MetodoPagamentoDto dto) {
        return ResponseEntity.ok(pagamentoService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<MetodoPagamentoDto>> listAll() {
        return ResponseEntity.ok(pagamentoService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetodoPagamentoDto> getById(@PathVariable @NotNull Long id) {
        return ResponseEntity.ok(pagamentoService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetodoPagamentoDto> update(
            @PathVariable @NotNull Long id,
            @RequestBody @Valid MetodoPagamentoDto dto
    ) {
        return ResponseEntity.ok(pagamentoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @NotNull Long id) {
        pagamentoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
