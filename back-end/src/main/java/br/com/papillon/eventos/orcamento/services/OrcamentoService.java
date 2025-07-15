package br.com.papillon.eventos.orcamento.services;

import java.util.List;
import java.util.stream.Collectors;

import br.com.papillon.eventos.cliente.entities.Cliente;
import br.com.papillon.eventos.cliente.repositories.ClienteRepository;
import br.com.papillon.eventos.cliente.services.ClienteService;
import br.com.papillon.eventos.evento.services.EventoService;
import br.com.papillon.eventos.orcamento.dtos.OrcamentoCreateDto;
import br.com.papillon.eventos.orcamento.dtos.OrcamentoShowDto;
import br.com.papillon.eventos.orcamento.entities.OrcamentoStatus;

import org.springframework.stereotype.Service;


import br.com.papillon.eventos.orcamento.entities.Orcamento;
import br.com.papillon.eventos.orcamento.exception.OrcamentoNotFoundException;
import br.com.papillon.eventos.orcamento.repositories.OrcamentoRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class OrcamentoService {

    private final OrcamentoRepository repo;
    private final ClienteRepository clienteRepo;
    private final ClienteService clienteService;
    private final EventoService eventoService;

    public OrcamentoService(OrcamentoRepository repo, ClienteService clienteService, 
                EventoService eventoService, ClienteRepository clienteRepo) {
        this.clienteRepo = clienteRepo;
        this.repo = repo;
        this.clienteService = clienteService;
        this.eventoService = eventoService;
    }

    @Transactional
    public OrcamentoShowDto create(OrcamentoCreateDto dto) {
        Cliente cliente = clienteService.getByCpfCnpjOrCreate(dto.cliente());

        Orcamento orc = new Orcamento(dto, cliente);

        orc = repo.save(orc);
        return new OrcamentoShowDto(orc);
    }

    public List<OrcamentoShowDto> listAll() {
        return repo.findAll().stream()
                .map(OrcamentoShowDto::new)
                .collect(Collectors.toList());
    }

    public OrcamentoShowDto getById(Long id) {
        return new OrcamentoShowDto(
                repo.findById(id).orElseThrow(() -> new OrcamentoNotFoundException(id))
        );
    }

    public Orcamento getEntityById(Long id) {
        return repo.findById(id).orElseThrow(() -> new OrcamentoNotFoundException(id));
    }

    @Transactional
    public OrcamentoShowDto update(Long id, OrcamentoCreateDto dto) {
        var existente = repo.findById(id)
                .orElseThrow(() -> new OrcamentoNotFoundException(id));
        var cliente = clienteRepo.findByCpfCnpj(dto.cliente().cpfCnpj())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        existente.setCliente(cliente);
        existente.setDataDoEvento(dto.dataDoEvento());
        existente.setQuantidadePessoas(dto.quantidadePessoas());
        existente.setValorPorPessoa(dto.valorPorPessoa());
        existente.setDataLimite(dto.dataLimite());
//        existente.setCardapios(cardRepo.findAllById(dto.cardapioIds()));
//        existente.setFuncionarios(funcRepo.findAllById(dto.funcionarioIds()));
        return new OrcamentoShowDto(repo.save(existente));
    }

    @Transactional
    public OrcamentoShowDto changeStatus(Long id, OrcamentoStatus novoStatus) {
        Orcamento existente = repo.findById(id)
                .orElseThrow(() -> new OrcamentoNotFoundException(id));
        OrcamentoStatus antigo = existente.getStatus();
        existente.setStatus(novoStatus);
        Orcamento salvo = repo.save(existente);

        if (antigo != OrcamentoStatus.ACEITO
                && novoStatus == OrcamentoStatus.ACEITO) {
            eventoService.createFromOrcamento(salvo);
        }

        return new OrcamentoShowDto(salvo);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new OrcamentoNotFoundException(id);
        repo.deleteById(id);
    }
}
