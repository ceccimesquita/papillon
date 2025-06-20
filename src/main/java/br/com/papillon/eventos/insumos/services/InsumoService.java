package br.com.papillon.eventos.insumos.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.exceptions.InsumoNotFoundException;
import br.com.papillon.eventos.insumos.repositories.InsumoRepository;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.repositories.EventoRepository;

@Service
public class InsumoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private MetodoPagamentoRepository metodoPagamentoRepository;

    @Autowired
    private EventoRepository eventoRepository;

    public Insumo createInsumo(InsumoDto dto) {
        MetodoPagamento mp = metodoPagamentoRepository.findById(dto.metodoPagamento().id())
                .orElseThrow(() -> new RuntimeException("Método de pagamento com ID "
                        + dto.metodoPagamento().id() + " não encontrado"));
        Evento ev = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException("Evento com ID "
                        + dto.eventoId() + " não encontrado"));

        Insumo novo = new Insumo(
                dto.nome(),
                dto.valor(),
                mp,
                ev
        );
        return insumoRepository.save(novo);
    }

    public List<InsumoDto> listAllInsumos() {
        return insumoRepository.findAll().stream()
                .map(InsumoDto::new)
                .collect(Collectors.toList());
    }

    public InsumoDto getInsumoById(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new InsumoNotFoundException(id));
        return new InsumoDto(insumo);
    }

    public InsumoDto updateInsumoById(Long id, InsumoDto dto) {
        insumoRepository.findById(id)
                .orElseThrow(() -> new InsumoNotFoundException(id));

        MetodoPagamento mp = metodoPagamentoRepository.findById(dto.metodoPagamento().id())
                .orElseThrow(() -> new RuntimeException("Método de pagamento com ID "
                        + dto.metodoPagamento().id() + " não encontrado"));
        Evento ev = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException("Evento com ID "
                        + dto.eventoId() + " não encontrado"));

        Insumo atualizado = new Insumo(
                dto.nome(),
                dto.valor(),
                mp,
                ev
        );
        atualizado.setId(id);
        insumoRepository.save(atualizado);
        return new InsumoDto(atualizado);
    }

    public void deleteInsumoById(Long id) {
        if (!insumoRepository.existsById(id)) {
            throw new InsumoNotFoundException(id);
        }
        insumoRepository.deleteById(id);
    }
}
