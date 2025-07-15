package br.com.papillon.eventos.orcamento.controllers;

import java.util.List;

import br.com.papillon.eventos.orcamento.dtos.OrcamentoCreateDto;
import br.com.papillon.eventos.orcamento.dtos.OrcamentoShowDto;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import br.com.papillon.eventos.orcamento.entities.OrcamentoStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import br.com.papillon.eventos.orcamento.services.OrcamentoService;
import br.com.papillon.eventos.orcamento.services.PdfService;

@RestController
@RequestMapping("/api/orcamento")
public class OrcamentoController {

    private final OrcamentoService service;

    @Autowired
    private OrcamentoService orcamentoService;

    @Autowired
    private PdfService pdfService;

    public OrcamentoController(OrcamentoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrcamentoShowDto> create(@RequestBody @Validated OrcamentoCreateDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrcamentoShowDto>> list() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrcamentoShowDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrcamentoShowDto> update(@PathVariable Long id,
                                                   @RequestBody @Validated OrcamentoCreateDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }
    
    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<OrcamentoShowDto> changeStatus(
            @PathVariable Long id,
            @PathVariable OrcamentoStatus status) {

        OrcamentoShowDto updated = orcamentoService.changeStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Orcamento orcamento = orcamentoService.getEntityById(id); 
        byte[] pdfBytes = pdfService.generatePdfFromOrcamento(orcamento);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=orcamento_" + id + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

}

