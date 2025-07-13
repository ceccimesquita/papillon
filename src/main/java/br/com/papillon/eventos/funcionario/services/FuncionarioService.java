package br.com.papillon.eventos.funcionario.services;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.funcionario.repositories.FuncionarioRepository;
import br.com.papillon.eventos.evento.repositories.EventoRepository;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository repo;

    @Autowired
    private EventoRepository eventoRepo;

    @Transactional
    public FuncionarioDto createFuncionario(FuncionarioDto dto) {
        var evento = eventoRepo.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException("Evento não encontrado: " + dto.eventoId()));
        Funcionario f = new Funcionario(dto, evento);
        f = repo.save(f);
        return new FuncionarioDto(f);
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDto> listAllFuncionarios() {
        return repo.findAll().stream()
                .map(FuncionarioDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FuncionarioDto getFuncionarioById(Long id) {
        var f = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado: " + id));
        return new FuncionarioDto(f);
    }

    @Transactional
    public FuncionarioDto updateFuncionarioById(Long id, FuncionarioDto dto) {
        var existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado: " + id));
        var evento = eventoRepo.findById(dto.eventoId())
                .orElseThrow(() -> new RuntimeException("Evento não encontrado: " + dto.eventoId()));
        existing.setNome(dto.nome());
        existing.setFuncao(dto.funcao());
        existing.setValor(dto.valor());
        existing.setEvento(evento);
        // atualiza só o pagamento vinculado
        var mp = existing.getMetodoPagamento();
        var mpDto = dto.metodoPagamento();
        mp.setNome(mpDto.nome());
        mp.setValor(mpDto.valor());
        mp.setData(mpDto.data());
        existing = repo.save(existing);
        return new FuncionarioDto(existing);
    }

    @Transactional
    public void deleteFuncionarioById(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Funcionário não encontrado: " + id);
        }
        repo.deleteById(id);
    }
}
