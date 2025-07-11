package br.com.papillon.eventos.funcionario.controllers;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.funcionario.services.FuncionarioService;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    private final FuncionarioService service;

    public FuncionarioController(FuncionarioService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<FuncionarioDto> createFuncionario(@Valid @RequestBody FuncionarioDto dto) {
        return ResponseEntity.ok(service.createFuncionario(dto));
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioDto>> listAll() {
        return ResponseEntity.ok(service.listAllFuncionarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFuncionarioById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuncionarioDto> update(
            @PathVariable Long id,
            @Valid @RequestBody FuncionarioDto dto) {
        return ResponseEntity.ok(service.updateFuncionarioById(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteFuncionarioById(id);
        return ResponseEntity.noContent().build();
    }
}
