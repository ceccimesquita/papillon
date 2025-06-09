package br.com.papillon.eventos.orcamento.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.orcamento.dtos.OrcamentoDto;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import br.com.papillon.eventos.orcamento.exception.OrcamentoNotFoundException;
import br.com.papillon.eventos.orcamento.repositories.OrcamentoRepository;

@Service
public class OrcamentoService {

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    public Orcamento createOrcamento(OrcamentoDto dto) {
        try {
            Orcamento novo = new Orcamento(dto);
            return orcamentoRepository.save(novo);
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao criar orçamento", dae);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao criar orçamento", e);
        }
    }

    public List<OrcamentoDto> listAllOrcamentos() {
        try {
            return orcamentoRepository.findAll().stream()
                    .map(OrcamentoDto::new)
                    .collect(Collectors.toList());
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao listar orçamentos", dae);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao listar orçamentos", e);
        }
    }

    public OrcamentoDto getOrcamentoById(Long id) {
        try {
            Orcamento orc = orcamentoRepository.findById(id)
                    .orElseThrow(() -> new OrcamentoNotFoundException(id));
            return new OrcamentoDto(orc);
        } catch (OrcamentoNotFoundException onfe) {
            throw onfe;
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao buscar orçamento com ID " + id, dae);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao buscar orçamento", e);
        }
    }

    public OrcamentoDto updateOrcamentoById(Long id, OrcamentoDto dto) {
        try {
            orcamentoRepository.findById(id)
                    .orElseThrow(() -> new OrcamentoNotFoundException(id));
            Orcamento atualizado = new Orcamento(dto);
            atualizado.setId(id);
            orcamentoRepository.save(atualizado);
            return new OrcamentoDto(atualizado);
        } catch (OrcamentoNotFoundException onfe) {
            throw onfe;
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao atualizar orçamento com ID " + id, dae);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao atualizar orçamento", e);
        }
    }

    public void deleteOrcamentoById(Long id) {
        try {
            if (!orcamentoRepository.existsById(id)) {
                throw new OrcamentoNotFoundException(id);
            }
            orcamentoRepository.deleteById(id);
        } catch (OrcamentoNotFoundException onfe) {
            throw onfe;
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao excluir orçamento com ID " + id, dae);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado ao excluir orçamento", e);
        }
    }
}
