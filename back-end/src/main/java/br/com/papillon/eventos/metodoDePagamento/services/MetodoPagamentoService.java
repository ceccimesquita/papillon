package br.com.papillon.eventos.metodoDePagamento.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.papillon.eventos.metodoDePagamento.dtos.MetodoPagamentoDto;
import br.com.papillon.eventos.metodoDePagamento.entities.MetodoPagamento;
import br.com.papillon.eventos.metodoDePagamento.exceptions.MetodoPagamentoNotFoundException;
import br.com.papillon.eventos.metodoDePagamento.repositories.MetodoPagamentoRepository;

@Service
public class MetodoPagamentoService {

    @Autowired
    private MetodoPagamentoRepository pagamentoRepository;

    public MetodoPagamentoDto create(MetodoPagamentoDto dto) {
        // Constrói a entidade a partir do DTO e salva
        MetodoPagamento mp = new MetodoPagamento(dto);
        MetodoPagamento salvo = pagamentoRepository.save(mp);
        return new MetodoPagamentoDto(salvo);
    }

    public List<MetodoPagamentoDto> listAll() {
        return pagamentoRepository.findAll().stream()
                .map(MetodoPagamentoDto::new)
                .collect(Collectors.toList());
    }

    public MetodoPagamentoDto getById(Long id) {
        MetodoPagamento mp = pagamentoRepository.findById(id)
                .orElseThrow(() -> new MetodoPagamentoNotFoundException(id));
        return new MetodoPagamentoDto(mp);
    }

    public MetodoPagamentoDto update(Long id, MetodoPagamentoDto dto) {
        // Busca o existente ou lança 404
        MetodoPagamento existente = pagamentoRepository.findById(id)
                .orElseThrow(() -> new MetodoPagamentoNotFoundException(id));
        // Atualiza campos
        existente.setNome(dto.nome());
        existente.setValor(dto.valor());
        existente.setData(dto.data());
        MetodoPagamento atualizado = pagamentoRepository.save(existente);
        return new MetodoPagamentoDto(atualizado);
    }

    public void delete(Long id) {
        if (!pagamentoRepository.existsById(id)) {
            throw new MetodoPagamentoNotFoundException(id);
        }
        pagamentoRepository.deleteById(id);
    }
}
