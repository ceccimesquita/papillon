package br.com.papillon.eventos.insumos.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.insumos.dtos.InsumoDto;
import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.exceptions.InsumoNotFoundException;
import br.com.papillon.eventos.insumos.repositories.InsumoRepository;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.repositories.EventoRepository;

@Service
public class InsumoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private EventoRepository eventoRepository;

    public Insumo createInsumo(InsumoDto dto) {
        Evento ev = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException("Evento não encontrado: " + dto.eventoId()));

        Insumo novo = new Insumo(dto, ev);
        // como cascade=ALL em Insumo.metodoPagamento, o pagamento será salvo junto
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

    @Transactional
    public void deleteInsumoById(Long id) {
        System.out.println(">>>> Deletando insumo id=" + id);
        if (!insumoRepository.existsById(id)) {
            throw new InsumoNotFoundException(id);
        }
        insumoRepository.deleteById(id);
    }
}
