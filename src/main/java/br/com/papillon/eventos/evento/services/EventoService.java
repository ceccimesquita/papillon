package br.com.papillon.eventos.evento.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.exception.EventoNotFoundException;
import br.com.papillon.eventos.evento.repositories.EventoRepository;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private EventoCalculadora eventoCalculadora;

    public Evento createEvento(EventoCreateDto eventoDto) {
        try {
            Evento evento = new Evento(eventoDto);
            return eventoRepository.save(evento);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao salvar evento: " + e.getMessage());
        }
    }

    public List<EventoShowDto> listarTodos() {
        try {
            List<Evento> eventos = eventoRepository.findAll();
            return eventos.stream()
                    .map(evento -> new EventoShowDto(evento, evento.getInsumos()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao listar eventos: " + e.getMessage());
        }
    }

    public EventoShowDto getEventoById(Long id) {
        try {
            Evento evento = eventoRepository.findById(id)
                    .orElseThrow(() -> new EventoNotFoundException(id));
            return new EventoShowDto(evento, evento.getInsumos());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar evento por ID: " + e.getMessage());
        }
    }

    public void recalcularGastosELucro(Evento evento) {
        eventoCalculadora.calcularGastosELucro(evento);
        eventoRepository.save(evento);
    }

    public EventoCreateDto updateEvento(Long id, EventoCreateDto eventoDto) {
        try {
            Evento evento = eventoRepository.findById(id)
                    .orElseThrow(() -> new EventoNotFoundException(id));

            evento.setNome(eventoDto.nome());
            evento.setContratante(eventoDto.contratante());
            evento.setData(eventoDto.data());
            evento.setValor(eventoDto.valor());

            eventoRepository.save(evento);

            return new EventoCreateDto(evento);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao atualizar evento: " + e.getMessage());
        }
    }

    public void deleteEvento(Long id) {
        try {
            if (!eventoRepository.existsById(id)) {
                throw new EventoNotFoundException(id);
            }
            eventoRepository.deleteById(id);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao deletar evento: " + e.getMessage());
        }
    }

    public void recalcularGastosELucroEGravar(Evento evento) {
        eventoCalculadora.calcularGastosELucro(evento);
        eventoRepository.save(evento);
    }
}
