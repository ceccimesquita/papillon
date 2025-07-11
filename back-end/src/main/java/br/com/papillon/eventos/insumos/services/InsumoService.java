package br.com.papillon.eventos.insumos.services;

import java.util.List;
import java.util.stream.Collectors;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import org.springframework.transaction.annotation.Transactional;
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
    public InsumoDto updateInsumoById(Long id, InsumoDto dto) {
        // 1) Buscar o insumo existente
        Insumo existente = insumoRepository.findById(id)
                .orElseThrow(() -> new InsumoNotFoundException(id));

        // 2) Buscar o evento referenciado
        Evento ev = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException(
                        "Evento com ID " + dto.eventoId() + " não encontrado"
                ));

        // 3) Atualizar campos do Insumo
        existente.setNome(dto.nome());
        existente.setValor(dto.valor());
        existente.setEvento(ev);

        // 4) Atualizar o Método de Pagamento associado
        MetodoPagamentoDto mpDto = dto.metodoPagamento();
        MetodoPagamento mp = existente.getMetodoPagamento();
        mp.setNome(mpDto.nome());
        mp.setValor(mpDto.valor());
        mp.setData(mpDto.data());
        // (não precisa fazer `mp.setInsumo(existente)` porque usamos @OneToOne com cascade)

        // 5) Salvar tudo (cascade=ALL faz o update do pagamento também)
        Insumo atualizado = insumoRepository.save(existente);

        // 6) Retornar o DTO atualizado
        return new InsumoDto(atualizado);
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
