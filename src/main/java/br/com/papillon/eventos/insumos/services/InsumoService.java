package br.com.papillon.eventos.insumos.services;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import br.com.papillon.eventos.evento.services.EventoService;
import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.repositories.InsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsumoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private EventoService eventoService;

    public List<InsumoDto> listarTodos() {
        return insumoRepository.findAll().stream()
                .map(InsumoDto::new)
                .collect(Collectors.toList());
    }

    public InsumoDto buscarPorId(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo não encontrado"));
        return new InsumoDto(insumo);
    }

    public InsumoDto criar(InsumoDto dto) {
        Evento evento = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        Insumo insumo = new Insumo(dto, evento);
        insumo = insumoRepository.save(insumo);


        Evento eventoAtualizado = eventoRepository.findById(evento.getId())
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        eventoService.recalcularGastosELucroEGravar(eventoAtualizado);

        return new InsumoDto(insumo);
    }



    public InsumoDto atualizar(Long id, InsumoDto dto) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo não encontrado"));

        // Atualiza os dados do insumo
        insumo.setNome(dto.nome());
        insumo.setQuantidade(dto.quantidade());
        insumo.setPreco(dto.preco());
        insumo.setMetodoPagamento(dto.metodoPagamento());

        // Se mudou o evento associado, atualiza também
        if (!insumo.getEvento().getId().equals(dto.eventoId())) {
            Evento novoEvento = eventoRepository.findById(dto.eventoId())
                    .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
            insumo.setEvento(novoEvento);
        }

        // Salva insumo atualizado
        Insumo insumoAtualizado = insumoRepository.save(insumo);

        // Recalcula e grava os gastos/lucro no evento
        eventoService.recalcularGastosELucroEGravar(insumoAtualizado.getEvento());

        return new InsumoDto(insumoAtualizado);
    }

    public void deletar(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo não encontrado"));

        Evento evento = insumo.getEvento();

        // Remove insumo do banco
        insumoRepository.delete(insumo);

        // Recalcula e grava os gastos/lucro do evento afetado
        eventoService.recalcularGastosELucroEGravar(evento);
    }
}

