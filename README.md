# Vélora | Sistema de Aluguel de Carros

Protótipo web do Laboratório 02 de Desenvolvimento e Integração de Aplicações Web. O sistema conecta clientes, empresas e bancos no processo de solicitação, análise e contratação de aluguéis.

## Status

Protótipo acadêmico com fluxos de cliente, empresa e banco. O catálogo de demonstração inclui fotos dos cinco modelos raros. Os demais veículos usam uma imagem ilustrativa.

## Funcionalidades

- **Cliente** — cadastro de conta e login, CRUD do próprio perfil, até três empregadores com rendimentos, catálogo e criação, consulta, edição e cancelamento dos próprios pedidos.
- **Empresa** — gestão da frota, consulta e edição de pedidos pendentes com calendário de disponibilidade, parecer financeiro e formalização de contratos aprovados.
- **Banco** — consulta e edição de pedidos pendentes, análise dos rendimentos declarados, histórico de pareceres, formalização e concessão opcional de crédito em um contrato.
- **Disponibilidade e fila** — o calendário bloqueia somente períodos aprovados. Pedidos pendentes para o mesmo veículo e datas sobrepostas são avaliados por ordem de chegada. Ao aprovar o primeiro, o sistema recusa os posteriores em conflito e exibe o motivo em **Meus aluguéis**.
- **Regras** — cancelamento e edição antes da decisão, e exclusão de cadastros e veículos apenas quando não há pedidos vinculados.

As datas de início e término são escolhidas no calendário do formulário. Na edição pela empresa ou pelo banco, se a consulta de disponibilidade falhar, o calendário usa os períodos aprovados da lista de solicitações. A tela do cliente depende da rota de disponibilidade, que deve estar presente na versão em execução do backend.

## Tecnologias e arquitetura

Java 25, Spring Boot 4.0.5, Maven Wrapper, Spring MVC REST, Spring Security, Spring Data JPA e Supabase PostgreSQL no backend. React, TypeScript e Vite no frontend.

A interface React apresenta as telas e chama a API. Os controladores Spring MVC recebem e validam as requisições. Os serviços aplicam regras de negócio, os repositórios persistem o modelo e os DTOs representam os dados trafegados pela API. O Spring Security autentica com usuário e senha e autoriza os perfis. A interface mantém a sessão em um cookie HTTP-only, e as senhas são protegidas com BCrypt.

## Documentação

- [Histórias do usuário](documentacao/historias-usuario.md)
- [Casos de uso](documentacao/uml/casos-de-uso.puml)
- [Diagrama de classes](documentacao/uml/diagrama-classes.puml)
- [Diagrama de pacotes](documentacao/uml/diagrama-pacotes.puml)
- [Revisões e roteiro de demonstração](documentacao/revisao-e-demonstracao.md)

## Instalação e execução

### Pré-requisitos

JDK 25, Node.js 22.12 ou superior na série 22, npm e um projeto Supabase com acesso PostgreSQL.

### Backend

No diretório `backend`, copie `.env.example` para `.env` e preencha `DB_URL` com a URL JDBC do Supabase, `DB_USER` e `DB_PASSWORD`. Use uma conexão PostgreSQL com SSL e uma conta com permissão para criar ou atualizar as tabelas do protótipo. O Spring lê o arquivo quando iniciado desse diretório.

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
.\mvnw.cmd spring-boot:run
```

A API usa a porta 8081. Em Linux ou macOS, use `./mvnw spring-boot:run`.

Depois de atualizar a aplicação, reinicie o backend antes de entrar. Se `GET /api/auth/csrf` retornar 401 ou 404 na tela de login, confira se o processo na porta 8081 está executando a versão atual. Essa rota deve responder antes do login.

### Contas de empresa e banco

O cadastro público cria contas de cliente. Para cadastrar agentes, defina `AGENTE_EMPRESA_LOGIN`, `AGENTE_EMPRESA_SENHA`, `AGENTE_BANCO_LOGIN` e `AGENTE_BANCO_SENHA` no `.env` e inicie uma vez com o perfil `criar-agentes`.

```powershell
.\mvnw.cmd '-Dspring-boot.run.profiles=criar-agentes' spring-boot:run
```

É possível configurar só um dos pares. Uma conta existente com o mesmo perfil é preservada. Depois da criação, remova do arquivo as variáveis dos agentes e use o comando normal de execução.

Se o login escolhido já foi usado no formulário **Criar conta de cliente**, escolha outro para a conta de banco. Entre com a nova conta e confira o perfil **BANCO** no menu. O painel **Visão financeira** oferece um atalho para **Análise financeira**.

### Frontend

Em outro terminal, a partir da raiz do projeto:

```powershell
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. O Vite encaminha as rotas `/api` ao backend.

### Catálogo de demonstração

Após iniciar o backend pela primeira vez, execute a [carga SQL do catálogo](documentacao/catalogo-demonstracao.sql) no editor SQL do Supabase para cadastrar cinco modelos raros. A carga usa placas e matrículas fictícias e preserva os veículos já cadastrados.

Os [créditos e licenças das fotos](documentacao/creditos-fotos.md) estão documentados no projeto.

## Estrutura de pastas

| Pasta | Conteúdo |
|---|---|
| `backend/` | API Spring MVC, regras, persistência e testes |
| `frontend/` | Interface React, estilos e serviços de integração |
| `documentacao/` | Histórias, diagramas PlantUML e roteiro da apresentação |

## Testes

- No backend, execute `.\mvnw.cmd test`. Os testes usam um banco H2 em memória, separado do Supabase.
- No frontend, execute `npm run build` e `npm run lint`.
- Para conferir os fluxos pela interface com Supabase, siga o roteiro de demonstração.

## Autoria

Mayra Santos · Engenharia de Software · Laboratório 02 de DIAW.

README baseado no [modelo da disciplina](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/blob/main/TEMPLATES/template_README.md).
