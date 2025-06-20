package br.com.papillon.eventos.funcionario.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.funcionario.services.FuncionarioService;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    @Autowired
    private FuncionarioService funcionarioService;

    // Criar novo funcionário
    @PostMapping
    public ResponseEntity<Funcionario> createFuncionario(@RequestBody @Valid FuncionarioDto dto) {
        Funcionario criado = funcionarioService.createFuncionario(dto);
        return ResponseEntity.ok(criado);
    }

    // Listar todos os funcionários
    @GetMapping
    public ResponseEntity<List<FuncionarioDto>> listAllFuncionarios() {
        List<FuncionarioDto> lista = funcionarioService.listAllFuncionarios();
        return ResponseEntity.ok(lista);
    }

    // Obter funcionário por ID
    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioDto> getFuncionarioById(@PathVariable Long id) {
        FuncionarioDto dto = funcionarioService.getFuncionarioById(id);
        return ResponseEntity.ok(dto);
    }

    // Atualizar funcionário por ID
    @PutMapping("/{id}")
    public ResponseEntity<FuncionarioDto> updateFuncionarioById(
            @PathVariable @NotNull Long id,
            @RequestBody @Valid FuncionarioDto dto) {
        FuncionarioDto atualizado = funcionarioService.updateFuncionarioById(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    // Excluir funcionário por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuncionarioById(@PathVariable Long id) {
        funcionarioService.deleteFuncionarioById(id);
        return ResponseEntity.noContent().build();
    }
}
