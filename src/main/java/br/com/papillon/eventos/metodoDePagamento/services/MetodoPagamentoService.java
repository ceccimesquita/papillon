package br.com.papillon.eventos.metodoDePagamento.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.insumos.entities.Insumo;
import br.com.papillon.eventos.insumos.repositories.InsumoRepository;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.funcionario.repositories.FuncionarioRepository;
import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.exceptions.MetodoPagamentoNotFoundException;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;

@Service
public class MetodoPagamentoService {

    @Autowired
    private MetodoPagamentoRepository pagamentoRepository;

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    // RECEBE e RETORNA DTO
    public MetodoPagamentoDto create(MetodoPagamentoDto dto) {
        try {
            Insumo insumo = dto.insumoId() != null
                    ? insumoRepository.findById(dto.insumoId())
                    .orElseThrow(() -> new RuntimeException("Insumo não encontrado: " + dto.insumoId()))
                    : null;

            Funcionario func = dto.funcionarioId() != null
                    ? funcionarioRepository.findById(dto.funcionarioId())
                    .orElseThrow(() -> new RuntimeException("Funcionário não encontrado: " + dto.funcionarioId()))
                    : null;

            MetodoPagamento mp = new MetodoPagamento(
                    null,                // id será gerado
                    dto.nome(),
                    dto.valor(),
                    dto.data(),
                    insumo,
                    func
            );
            mp = pagamentoRepository.save(mp);
            return new MetodoPagamentoDto(mp);
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao criar Método de Pagamento", dae);
        }
    }

    public List<MetodoPagamentoDto> listAll() {
        try {
            return pagamentoRepository.findAll().stream()
                    .map(MetodoPagamentoDto::new)
                    .collect(Collectors.toList());
        } catch (DataAccessException dae) {
            throw new RuntimeException("Erro ao listar Métodos de Pagamento", dae);
        }
    }

    public MetodoPagamentoDto getById(Long id) {
        MetodoPagamento mp = pagamentoRepository.findById(id)
                .orElseThrow(() -> new MetodoPagamentoNotFoundException(id));
        return new MetodoPagamentoDto(mp);
    }

    // ASSINATURA AJUSTADA: retorna DTO
    public MetodoPagamentoDto update(Long id, MetodoPagamentoDto dto) {
        pagamentoRepository.findById(id)
                .orElseThrow(() -> new MetodoPagamentoNotFoundException(id));

        Insumo insumo = dto.insumoId() != null
                ? insumoRepository.findById(dto.insumoId())
                .orElseThrow(() -> new RuntimeException("Insumo não encontrado: " + dto.insumoId()))
                : null;

        Funcionario func = dto.funcionarioId() != null
                ? funcionarioRepository.findById(dto.funcionarioId())
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado: " + dto.funcionarioId()))
                : null;

        MetodoPagamento atualizado = new MetodoPagamento(
                id,
                dto.nome(),
                dto.valor(),
                dto.data(),
                insumo,
                func
        );
        atualizado = pagamentoRepository.save(atualizado);
        return new MetodoPagamentoDto(atualizado);
    }

    public void delete(Long id) {
        if (!pagamentoRepository.existsById(id)) {
            throw new MetodoPagamentoNotFoundException(id);
        }
        pagamentoRepository.deleteById(id);
    }
}
