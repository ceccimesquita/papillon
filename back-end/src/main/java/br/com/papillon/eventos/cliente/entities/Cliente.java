package br.com.papillon.eventos.cliente.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import br.com.papillon.eventos.cliente.dtos.ClienteDto;

@Entity
@Table(name = "clientes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 100)
    @NotBlank
    private String nome;

    @Size(max = 100)
    @NotBlank
    private String email;

    @Size(max = 20)
    @NotBlank
    private String cpfCnpj;

    @Size(max = 20)
    @NotBlank
    private String telefone;

    public Cliente(ClienteDto dto) {
        this.nome = dto.nome();
        this.email = dto.email();
        this.cpfCnpj = dto.cpfCnpj();
        this.telefone = dto.telefone();
    }
}
