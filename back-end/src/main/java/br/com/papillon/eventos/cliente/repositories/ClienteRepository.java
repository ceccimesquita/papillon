package br.com.papillon.eventos.cliente.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.papillon.eventos.cliente.entities.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByCpfCnpj(String cpfCnpj);
    Optional<Cliente> findByCpfCnpj(String cpfCnpj);
}
