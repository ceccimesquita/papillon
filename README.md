# Papillon

Gastronomia de luxo

## Descrição

O Papilom é um sistema para cadastro e controle de orçamentos e eventos. Permite criar orçamentos, gerenciar insumos e funcionários associados, converter orçamentos aprovados em eventos, calcular gastos e lucros automaticamente, além de gerar relatórios em PDF.

## Documentação

A documentação completa do projeto está disponível em:

[Documentação Papilom](https://docs.google.com/document/d/1K00oKmpRH6VaxqwlFyiB_VwEJYwd1FXULJiXjJL8aWo/edit?usp=sharing)

## Tecnologias

### Back-End
- Java 17  
- Spring Boot  
- Spring Data JPA (Hibernate)  
- PostgreSQL  
- Maven  
- MapStruct (DTO mapping)  
- Lombok  

### Front-End

 - Next.js


## Estrutura do Back-End

```plaintext
src/
└── main/
    └── java/
        └── br/
            └── com/
                └── papillon/
                    └── eventos/
                        ├── cliente/         # Entidade Cliente e ClienteRepository
                        ├── orcamento/       # Entidade Orcamento, OrcamentoController, OrcamentoService
                        ├── evento/          # Entidade Evento, EventoController, EventoService
                        ├── insumo/          # Entidade Insumo, InsumoController, InsumoService
                        ├── funcionario/     # Entidade Funcionario, FuncionarioController, FuncionarioService
                        ├── pagamento/       # Entidade MetodoPagamento
                        └── config/          # Configurações gerais (Swagger, CORS, etc.)


