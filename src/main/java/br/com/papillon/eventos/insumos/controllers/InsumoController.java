package br.com.papillon.eventos.insumos.controllers;

import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.services.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    @Autowired
    private InsumoService insumoService;

    @GetMapping
    public List<InsumoDto> listarTodos() {
        return insumoService.listarTodos();
    }

    @GetMapping("/{id}")
    public InsumoDto buscarPorId(@PathVariable Long id) {
        return insumoService.buscarPorId(id);
    }

    @PostMapping
    public InsumoDto criar(@RequestBody InsumoDto dto) {
        return insumoService.criar(dto);
    }

    @PutMapping("/{id}")
    public InsumoDto atualizar(@PathVariable Long id, @RequestBody InsumoDto dto) {
        return insumoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        insumoService.deletar(id);
    }
}
