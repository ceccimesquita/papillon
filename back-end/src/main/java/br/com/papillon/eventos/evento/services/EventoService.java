package br.com.papillon.eventos.evento.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.dtos.EventoSimpleDto;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.exception.EventoNotFoundException;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;



@Service
public class EventoService {
    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public EventoShowDto createEvento(EventoCreateDto dto) {
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        Evento novo = new Evento(dto, cliente);
        // inicializa explicitamente
        novo.setGastos(BigDecimal.ZERO);
        novo.setLucro(BigDecimal.ZERO);

        Evento salvo = eventoRepository.save(novo);
        // não há insumos nem funcionários ainda, mas vamos garantir
        return new EventoShowDto(salvo);
    }

    public List<EventoShowDto> listAllEventos() {
        return eventoRepository.findAllByOrderByDataDesc()
                .stream()
                .map(EventoShowDto::new)
                .collect(Collectors.toList());
    }

    public EventoShowDto getEventoById(Long id) {
        Evento ev = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        return new EventoShowDto(ev);
    }

    public List<EventoSimpleDto> getEventosSimplesByClienteId(Long clienteId) {
        return eventoRepository.findByClienteId(clienteId).stream()
            .map(EventoSimpleDto::new)
            .collect(Collectors.toList());
    }


    @Transactional
    public EventoShowDto updateEvento(Long id, EventoCreateDto dto) {
        Evento existente = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        existente.setNome(dto.nome());
        existente.setCliente(cliente);
        existente.setData(dto.data());
        existente.setValor(dto.valor());

        Evento salvo = eventoRepository.save(existente);
        return new EventoShowDto(salvo);
    }

    @Transactional
    public EventoShowDto createFromOrcamento(Orcamento orc) {
        EventoCreateDto dto = new EventoCreateDto(
                "Evento para " + orc.getCliente().getNome(),
                orc.getCliente().getId(),
                orc.getDataDoEvento(),
                orc.getValorTotal(),
                "PENDENTE"
        );
        Evento novo = new Evento(dto, orc.getCliente());

        novo.setQtdPessoas(orc.getQuantidadePessoas());

        novo.setFuncionarios(
            orc.getFuncionarios().stream()
                .map(Funcionario::new)
                .collect(Collectors.toList())
        );
        novo.setCardapios(
            orc.getCardapios().stream()
                .map(Cardapio::new)
                .collect(Collectors.toList())
        );

        novo.setGastos(BigDecimal.ZERO);
        novo.setLucro(BigDecimal.ZERO);

        Evento salvo = eventoRepository.save(novo);
        return new EventoShowDto(salvo);
    }

    @Transactional
    public void deleteEvento(Long id) {
        if (!eventoRepository.existsById(id)) throw new EventoNotFoundException(id);
        eventoRepository.deleteById(id);
    }

    public void atualizarStatus(Long id, String novoStatus) {
    Evento evento = eventoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        evento.setStatus(novoStatus);
        eventoRepository.save(evento);
    }

}

