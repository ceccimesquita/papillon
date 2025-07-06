package br.com.papillon.eventos.evento.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.exception.EventoNotFoundException;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    // Cria e retorna o DTO de exibição completo
    public EventoShowDto createEvento(EventoCreateDto dto) {
        Cliente cliente = clienteRepository
                .findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.clienteId()));

        // Construtor ajustado já inicializa gastos, lucro, insumos e funcionários
        Evento novo = new Evento(dto, cliente);

        Evento salvo = eventoRepository.save(novo);
        return new EventoShowDto(salvo);
    }

    public List<EventoShowDto> listAllEventos() {
        return eventoRepository.findAll()
                .stream()
                .map(EventoShowDto::new)
                .collect(Collectors.toList());
    }

    public EventoShowDto getEventoById(Long id) {
        Evento ev = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        return new EventoShowDto(ev);
    }

    @Transactional
    public EventoShowDto updateEvento(Long id, EventoCreateDto dto) {
        Evento existente = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));

        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + dto.clienteId()));

        // aplica as alterações
        existente.setNome(dto.nome());
        existente.setCliente(cliente);
        existente.setData(dto.data());
        existente.setValor(dto.valor());
        // gastos, lucro e coleções (insumos, funcionários) permanecem intactos

        Evento salvo = eventoRepository.save(existente);
        return new EventoShowDto(salvo);
    }

    /**
     * Remove um evento pelo ID.
     */
    @Transactional
    public void deleteEvento(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new EventoNotFoundException(id);
        }
        eventoRepository.deleteById(id);
    }
}

