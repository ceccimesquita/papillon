package br.com.papillon.eventos.evento.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import br.com.papillon.eventos.cardapios.entities.Cardapio;
import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.evento.dtos.EventoCreateDto;
import br.com.papillon.eventos.evento.dtos.EventoShowDto;
import br.com.papillon.eventos.evento.dtos.EventoSimpleDto;
import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.exception.EventoNotFoundException;
import br.com.papillon.eventos.evento.repositories.EventoRepository;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

import org.springframework.transaction.annotation.Transactional;



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
        recalcularGastosELucro(salvo);
        return new EventoShowDto(salvo);
    }

    public List<EventoShowDto> listAllEventos() {
        return eventoRepository.findAll()
                .stream()
                .peek(this::recalcularGastosELucro)   // recalcula antes de mapear
                .map(EventoShowDto::new)
                .collect(Collectors.toList());
    }

    public EventoShowDto getEventoById(Long id) {
        Evento ev = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        recalcularGastosELucro(ev);
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
        // as listas e gastos/lucro serão atualizados abaixo

        Evento salvo = eventoRepository.save(existente);
        recalcularGastosELucro(salvo);
        return new EventoShowDto(salvo);
    }

    @Transactional
    public EventoShowDto createFromOrcamento(Orcamento orc) {
        EventoCreateDto dto = new EventoCreateDto(
                "Evento para " + orc.getCliente().getNome(),
                orc.getCliente().getId(),
                orc.getDataDoEvento(),
                orc.getValorTotal(),
                "Em andamento"
        );
        Evento novo = new Evento(dto, orc.getCliente());

        novo.setFuncionarios(
            orc.getFuncionarios().stream()
                .map(Funcionario::new) // Crie construtor copy-constructor se necessário
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
        recalcularGastosELucro(salvo);
        return new EventoShowDto(salvo);
    }

    @Transactional
    public void deleteEvento(Long id) {
        if (!eventoRepository.existsById(id)) throw new EventoNotFoundException(id);
        eventoRepository.deleteById(id);
    }

    // --------------------------------------------------------
    private void recalcularGastosELucro(Evento evento) {
        return;
    }
}

