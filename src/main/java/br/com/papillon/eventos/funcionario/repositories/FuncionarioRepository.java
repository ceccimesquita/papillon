package br.com.papillon.eventos.funcionario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.papillon.eventos.funcionario.entities.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
}
