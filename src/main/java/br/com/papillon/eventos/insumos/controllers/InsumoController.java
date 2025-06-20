package br.com.papillon.eventos.insumos.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.services.InsumoService;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    @Autowired
    private InsumoService insumoService;

    // Criar novo insumo
    @PostMapping
    public ResponseEntity<Insumo> createInsumo(@RequestBody @Valid InsumoDto dto) {
        Insumo criado = insumoService.createInsumo(dto);
        return ResponseEntity.ok(criado);
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

    // Atualizar insumo por ID
    @PutMapping("/{id}")
    public ResponseEntity<InsumoDto> updateInsumoById(
            @PathVariable @NotNull Long id,
            @RequestBody @Valid InsumoDto dto) {
        InsumoDto atualizado = insumoService.updateInsumoById(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    // Excluir insumo por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsumoById(@PathVariable Long id) {
        insumoService.deleteInsumoById(id);
        return ResponseEntity.noContent().build();
    }
}
