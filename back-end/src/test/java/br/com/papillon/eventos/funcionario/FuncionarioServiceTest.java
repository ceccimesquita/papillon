package br.com.papillon.eventos.funcionario;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import br.com.papillon.eventos.funcionario.dtos.FuncionarioDto;
import br.com.papillon.eventos.funcionario.entities.Funcionario;
import br.com.papillon.eventos.funcionario.exception.FuncionarioNotFoundException;
import br.com.papillon.eventos.funcionario.repositories.FuncionarioRepository;
import br.com.papillon.eventos.funcionario.services.FuncionarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceTest {

    @Mock
    private FuncionarioRepository repo;

    @InjectMocks
    private FuncionarioService service;

    private FuncionarioDto dto;
    private Funcionario entity;

    @BeforeEach
    void setup() {
        dto = new FuncionarioDto(
                null,
                "João Silva",
                "Cozinheiro",
                BigDecimal.valueOf(150)
        );

        entity = new Funcionario(dto);
        entity.setId(1L);
        entity.setNome("João Silva");
        entity.setFuncao("Cozinheiro");
        entity.setValor(BigDecimal.valueOf(150));
    }

    @Test
    void createFuncionario_sucesso() {
        when(repo.save(any(Funcionario.class))).thenReturn(entity);

        FuncionarioDto result = service.createFuncionario(dto);

        verify(repo).save(any(Funcionario.class));
        assertThat(result.id()).isEqualTo(entity.getId());
        assertThat(result.nome()).isEqualTo("João Silva");
        assertThat(result.funcao()).isEqualTo("Cozinheiro");
        assertThat(result.valor()).isEqualByComparingTo(BigDecimal.valueOf(150));
    }

    @Test
    void listAllFuncionarios_vazio() {
        when(repo.findAll()).thenReturn(Collections.emptyList());

        List<FuncionarioDto> list = service.listAllFuncionarios();

        assertThat(list).isEmpty();
    }

    @Test
    void listAllFuncionarios_retornamDtos() {
        when(repo.findAll()).thenReturn(List.of(entity));

        List<FuncionarioDto> list = service.listAllFuncionarios();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).id()).isEqualTo(1L);
        assertThat(list.get(0).nome()).isEqualTo("João Silva");
    }

    @Test
    void getFuncionarioById_sucesso() {
        when(repo.findById(1L)).thenReturn(Optional.of(entity));

        FuncionarioDto result = service.getFuncionarioById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.nome()).isEqualTo("João Silva");
    }

    @Test
    void getFuncionarioById_naoEncontrado_lancaRuntimeException() {
        when(repo.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getFuncionarioById(2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Funcionário não encontrado: 2");
    }

    @Test
    void updateFuncionarioById_sucesso() {
        when(repo.findById(1L)).thenReturn(Optional.of(entity));

        FuncionarioDto updateDto = new FuncionarioDto(
                null,
                "Maria Souza",
                "Garçon",
                BigDecimal.valueOf(200)
        );

        FuncionarioDto result = service.updateFuncionarioById(1L, updateDto);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.nome()).isEqualTo("Maria Souza");
        assertThat(result.funcao()).isEqualTo("Garçon");
        assertThat(result.valor()).isEqualByComparingTo(BigDecimal.valueOf(200));
    }

    @Test
    void updateFuncionarioById_naoEncontrado_lancaRuntimeException() {
        when(repo.findById(3L)).thenReturn(Optional.empty());

        FuncionarioDto updateDto = new FuncionarioDto(
                null,
                "X",
                "Y",
                BigDecimal.ZERO
        );

        assertThatThrownBy(() -> service.updateFuncionarioById(3L, updateDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Funcionário não encontrado: 3");
    }

    @Test
    void deleteFuncionarioById_sucesso() {
        when(repo.existsById(1L)).thenReturn(true);

        service.deleteFuncionarioById(1L);

        verify(repo).deleteById(1L);
    }

    @Test
    void deleteFuncionarioById_naoEncontrado_lancaFuncionarioNotFoundException() {
        when(repo.existsById(4L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteFuncionarioById(4L))
                .isInstanceOf(FuncionarioNotFoundException.class)
                .hasMessageContaining("4");
    }
}