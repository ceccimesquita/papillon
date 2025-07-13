package br.com.papillon.eventos.cliente.controller;
import java.util.List;
import java.util.Map;

import br.com.papillon.eventos.cliente.dtos.ClienteDetailsDto;
import br.com.papillon.eventos.cliente.dtos.ClienteDto;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.exceptions.ClienteAlreadyExistsException;
import br.com.papillon.eventos.cliente.services.ClienteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cliente")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerCliente(@RequestBody @Valid ClienteDto dto) {
        try {
            Cliente cliente = clienteService.registerCliente(dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Cliente registrado com sucesso",
                    "cliente", cliente
            ));
        } catch (ClienteAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    // Obter todos os clientes
    @GetMapping()
    public ResponseEntity<Map<String, List<ClienteDto>>> listAllClientes() {
        List<ClienteDto> clientes = clienteService.listAllClientes();
        return ResponseEntity.ok(Map.of("clientes", clientes));
    }

    // Obter cliente por ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, ClienteDto>> getClienteById(@PathVariable Long id) {
        ClienteDto cliente = clienteService.getClienteById(id);
        return ResponseEntity.ok(Map.of("cliente", cliente));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, ClienteDetailsDto>> getClienteDetails(@PathVariable Long id) {
        ClienteDetailsDto dto = clienteService.getClienteDetailsById(id);
        return ResponseEntity.ok(Map.of("cliente", dto));
    }

    // Atualizar cliente por ID
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateClienteById(@PathVariable @NotNull Long id,
                                                                 @RequestBody @Valid ClienteDto dto) {
        ClienteDto clienteAtualizado = clienteService.updateClienteById(id, dto);
        return ResponseEntity.ok(Map.of(
                "message", "Cliente atualizado com sucesso",
                "cliente", clienteAtualizado
        ));
    }

    // Excluir cliente por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteClienteById(@PathVariable Long id) {
        clienteService.deleteClienteById(id);
        return ResponseEntity.ok(Map.of("message", "Cliente excluído com sucesso"));
    }
}
