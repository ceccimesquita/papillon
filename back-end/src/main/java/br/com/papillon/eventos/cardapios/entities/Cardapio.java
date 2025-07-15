package br.com.papillon.eventos.cardapios.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Cardapio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "cardapio_id", nullable = false) 
    private List<Item> itens;

    public Cardapio(Cardapio original) {
        this.nome = original.getNome();
        this.itens = original.getItens().stream()
            .map(item -> Item.builder()
                .nome(item.getNome())
                .tipo(item.getTipo())
                .build())
            .collect(Collectors.toList());
    }


}
