package br.com.papillon.eventos.funcionario.services;

import java.util.List;
import java.util.stream.Collectors;

import br.com.papillon.eventos.funcionario.exception.FuncionarioNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.funcionario.repositories.FuncionarioRepository;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository repo;

    @Transactional
    public FuncionarioDto createFuncionario(FuncionarioDto dto) {
        Funcionario f = new Funcionario(dto);
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
        existing.setNome(dto.nome());
        existing.setFuncao(dto.funcao());
        existing.setValor(dto.valor());

        return new FuncionarioDto(existing);
    }

    @Transactional
    public void deleteFuncionarioById(Long id) {
        System.out.println(">>> Deletando funcionário id=" + id);

        if (!repo.existsById(id)) {
            throw new FuncionarioNotFoundException(id);
        }

        repo.deleteById(id);
        System.out.println(">>> Chamada deleteById concluída");
    }
}
