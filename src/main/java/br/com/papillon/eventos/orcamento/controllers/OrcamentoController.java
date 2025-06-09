package br.com.papillon.eventos.orcamento.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.papillon.eventos.orcamento.dtos.OrcamentoDto;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import br.com.papillon.eventos.orcamento.services.OrcamentoService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {

    @Autowired
    private OrcamentoService orcamentoService;

    // Criar novo orçamento
    @PostMapping
    public ResponseEntity<Orcamento> createOrcamento(@RequestBody @Valid OrcamentoDto dto) {
        Orcamento novo = orcamentoService.createOrcamento(dto);
        return ResponseEntity.ok(novo);
    }

    // Listar todos os orçamentos
    @GetMapping
    public ResponseEntity<List<OrcamentoDto>> listAllOrcamentos() {
        List<OrcamentoDto> lista = orcamentoService.listAllOrcamentos();
        return ResponseEntity.ok(lista);
    }

    // Obter orçamento por ID
    @GetMapping("/{id}")
    public ResponseEntity<OrcamentoDto> getOrcamentoById(@PathVariable Long id) {
        OrcamentoDto dto = orcamentoService.getOrcamentoById(id);
        return ResponseEntity.ok(dto);
    }

    // Atualizar orçamento por ID
    @PutMapping("/{id}")
    public ResponseEntity<OrcamentoDto> updateOrcamentoById(
            @PathVariable @NotNull Long id,
            @RequestBody @Valid OrcamentoDto dto) {
        OrcamentoDto atualizado = orcamentoService.updateOrcamentoById(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    // Excluir orçamento por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrcamentoById(@PathVariable Long id) {
        orcamentoService.deleteOrcamentoById(id);
        return ResponseEntity.noContent().build();
    }
}
