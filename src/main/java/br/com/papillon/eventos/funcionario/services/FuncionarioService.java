package br.com.papillon.eventos.funcionario.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.funcionario.exception.FuncionarioNotFoundException;
import br.com.papillon.eventos.funcionario.repositories.FuncionarioRepository;

import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;

import br.com.papillon.eventos.evento.entities.Evento;
import br.com.papillon.eventos.evento.repositories.EventoRepository;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private MetodoPagamentoRepository metodoPagamentoRepository;

    @Autowired
    private EventoRepository eventoRepository;

    public Funcionario createFuncionario(FuncionarioDto dto) {
        MetodoPagamento mp = metodoPagamentoRepository.findById(dto.metodoPagamento().id())
                .orElseThrow(() -> new RuntimeException(
                        "Método de pagamento não encontrado: " + dto.metodoPagamento().id()
                ));
        Evento ev = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException(
                        "Evento não encontrado: " + dto.eventoId()
                ));

        Funcionario novo = new Funcionario(
                dto.nome(),
                dto.funcao(),
                dto.valor(),
                mp,
                ev
        );
        return funcionarioRepository.save(novo);
    }

    public List<FuncionarioDto> listAllFuncionarios() {
        return funcionarioRepository.findAll().stream()
                .map(FuncionarioDto::new)
                .collect(Collectors.toList());
    }

    public FuncionarioDto getFuncionarioById(Long id) {
        Funcionario func = funcionarioRepository.findById(id)
                .orElseThrow(() -> new FuncionarioNotFoundException(id));
        return new FuncionarioDto(func);
    }

    public FuncionarioDto updateFuncionarioById(Long id, FuncionarioDto dto) {
        funcionarioRepository.findById(id)
                .orElseThrow(() -> new FuncionarioNotFoundException(id));

        MetodoPagamento mp = metodoPagamentoRepository.findById(dto.metodoPagamento().id())
                .orElseThrow(() -> new RuntimeException(
                        "Método de pagamento não encontrado: " + dto.metodoPagamento().id()
                ));
        Evento ev = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException(
                        "Evento não encontrado: " + dto.eventoId()
                ));

        Funcionario atualizado = new Funcionario(
                dto.nome(),
                dto.funcao(),
                dto.valor(),
                mp,
                ev
        );
        atualizado.setId(id);
        funcionarioRepository.save(atualizado);
        return new FuncionarioDto(atualizado);
    }

    public void deleteFuncionarioById(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new FuncionarioNotFoundException(id);
        }
        funcionarioRepository.deleteById(id);
    }
}
