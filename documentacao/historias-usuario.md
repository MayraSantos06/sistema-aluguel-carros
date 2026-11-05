# Histórias do Usuário — Sistema de Aluguel de Carros

**Disciplina:** Desenvolvimento e Integração de Aplicações Web (DIAW)  
**Atividade:** Laboratório 02  
**Projeto:** Sistema de Aluguel de Carros

## 1. Objetivo

Documentar as funcionalidades do Sistema de Aluguel de Carros a partir da perspectiva dos usuários, estabelecendo critérios de aceitação que orientarão a modelagem UML, a implementação e os testes.

O sistema permitirá que clientes realizem pedidos de aluguel de automóveis e que agentes de empresas e bancos participem da análise e do processamento dessas solicitações.

## 2. Histórias do Usuário

### HU01 — Cadastrar usuário

**Como** usuário, **quero** realizar meu cadastro no sistema, **para** obter acesso às funcionalidades de acordo com meu perfil.

**Critérios de aceitação:**
- O sistema deve permitir o cadastro prévio de usuários.
- Os campos obrigatórios devem ser validados.
- Não deve ser permitido cadastrar identificadores de usuário duplicados.
- As senhas devem ser armazenadas de forma segura, sem texto puro.
- O sistema deve informar o resultado do cadastro.

### HU02 — Realizar login

**Como** usuário cadastrado, **quero** realizar login com usuário e senha, **para** acessar as funcionalidades autorizadas.

**Critérios de aceitação:**
- O sistema deve solicitar usuário e senha.
- Credenciais inválidas devem impedir a autenticação.
- O sistema deve identificar o perfil do usuário.
- As funcionalidades protegidas devem exigir autenticação.
- O usuário deve conseguir encerrar sua sessão.

### HU03 — Cadastrar cliente

**Como** cliente, **quero** cadastrar minhas informações pessoais e profissionais, **para** possibilitar a contratação de aluguéis.

**Critérios de aceitação:**
- O sistema deve armazenar RG, CPF, nome, endereço e profissão.
- Deve permitir cadastrar até três entidades empregadoras.
- Cada entidade empregadora deve possuir o respectivo rendimento informado.
- Os campos obrigatórios devem ser validados.
- Os dados devem ser persistidos no banco de dados.

### HU04 — Consultar cliente

**Como** cliente, **quero** consultar meus dados cadastrais, **para** verificar as informações registradas no sistema.

**Critérios de aceitação:**
- O cliente deve estar autenticado.
- O sistema deve apresentar suas informações cadastrais.
- Os dados devem ser recuperados do banco de dados.
- Um cliente não deve acessar indevidamente os dados de outro.

### HU05 — Atualizar cliente

**Como** cliente, **quero** atualizar minhas informações cadastrais, **para** manter meus dados corretos.

**Critérios de aceitação:**
- O cliente deve estar autenticado.
- O sistema deve permitir alterar os campos autorizados.
- As informações atualizadas devem ser validadas.
- As alterações devem ser persistidas no banco de dados.
- O sistema deve confirmar a atualização.

### HU06 — Excluir cliente

**Como** usuário autorizado, **quero** excluir um cadastro de cliente, **para** realizar a manutenção dos registros do sistema.

**Critérios de aceitação:**
- A exclusão deve exigir autorização.
- O sistema deve solicitar confirmação antes de excluir.
- Devem ser verificadas possíveis dependências com pedidos e contratos.
- O sistema deve informar se a exclusão foi realizada ou impedida.

### HU07 — Criar pedido de aluguel

**Como** cliente, **quero** criar um pedido de aluguel de automóvel, **para** solicitar a contratação de um veículo.

**Critérios de aceitação:**
- O cliente deve estar autenticado.
- O sistema deve permitir selecionar um automóvel cadastrado.
- O pedido deve estar associado ao cliente.
- O sistema deve registrar a solicitação com um status inicial.
- O pedido deve ser armazenado no banco de dados.
- O sistema deve confirmar sua criação.

### HU08 — Consultar pedidos de aluguel

**Como** cliente, **quero** consultar meus pedidos, **para** acompanhar o andamento das solicitações.

**Critérios de aceitação:**
- O cliente deve visualizar seus pedidos cadastrados.
- Cada pedido deve apresentar seu status atual.
- O sistema deve permitir consultar os detalhes de um pedido.
- O cliente não deve visualizar pedidos de outros clientes sem autorização.

### HU09 — Modificar pedido como cliente

**Como** cliente, **quero** modificar um pedido de aluguel, **para** corrigir informações da solicitação.

**Critérios de aceitação:**
- O cliente deve estar autenticado.
- O pedido deve pertencer ao cliente.
- O sistema deve permitir modificar os campos autorizados.
- As alterações devem respeitar o estado atual do pedido.
- O sistema deve persistir e confirmar as alterações.

### HU10 — Cancelar pedido

**Como** cliente, **quero** cancelar um pedido de aluguel, **para** desistir de uma solicitação.

**Critérios de aceitação:**
- O cliente deve selecionar um pedido de sua titularidade.
- O sistema deve solicitar confirmação.
- O cancelamento deve respeitar as regras de negócio.
- O pedido deve receber o status de cancelado.
- O sistema deve registrar a alteração.

### HU11 — Avaliar pedido de aluguel

**Como** agente de empresa ou banco, **quero** avaliar pedidos de aluguel, **para** emitir um parecer sobre sua viabilidade financeira.

**Critérios de aceitação:**
- O agente deve estar autenticado e autorizado.
- O sistema deve permitir consultar as informações necessárias à análise.
- O agente deve conseguir registrar um parecer positivo ou negativo.
- O parecer deve ser associado ao pedido.
- O resultado deve influenciar o andamento da solicitação conforme as regras de negócio.

### HU12 — Modificar pedido como agente

**Como** agente de empresa ou banco, **quero** modificar informações autorizadas de um pedido, **para** atualizar seu processamento.

**Critérios de aceitação:**
- O agente deve estar autenticado.
- O sistema deve verificar suas permissões.
- As alterações devem respeitar as regras de negócio.
- Os dados atualizados devem ser persistidos.
- O sistema deve apresentar o estado atualizado do pedido.

### HU13 — Consultar automóveis

**Como** cliente, **quero** consultar os automóveis disponíveis para solicitação, **para** escolher um veículo.

**Critérios de aceitação:**
- O sistema deve apresentar os automóveis cadastrados.
- Cada automóvel deve possuir matrícula, ano, marca, modelo e placa.
- O cliente deve conseguir identificar o veículo que deseja solicitar.
- Os dados devem ser recuperados do banco de dados.

### HU14 — Gerenciar cadastro de automóveis

**Como** usuário autorizado, **quero** cadastrar e atualizar automóveis, **para** manter os registros de veículos utilizados nos contratos.

**Critérios de aceitação:**
- O sistema deve permitir registrar matrícula, ano, marca, modelo e placa.
- Os campos obrigatórios devem ser validados.
- A placa e a matrícula devem respeitar as regras de unicidade definidas.
- As alterações devem ser persistidas no banco de dados.
- O acesso deve ser restrito a usuários autorizados.

### HU15 — Gerenciar contrato de aluguel

**Como** agente autorizado, **quero** registrar e consultar contratos de aluguel, **para** formalizar as solicitações aprovadas.

**Critérios de aceitação:**
- O contrato deve estar associado à solicitação correspondente.
- A formalização deve respeitar o resultado da análise do pedido.
- O contrato deve identificar o automóvel e os contratantes.
- O sistema deve registrar a propriedade do automóvel conforme o tipo de contrato.
- Os dados devem ser persistidos no banco de dados.

### HU16 — Registrar contrato de crédito

**Como** agente bancário, **quero** registrar um contrato de crédito associado a um aluguel, **para** documentar o financiamento concedido.

**Critérios de aceitação:**
- O contrato de crédito deve estar associado ao aluguel correspondente.
- O banco responsável deve ser identificado.
- O sistema deve armazenar as informações do crédito concedido.
- O registro deve ser restrito a agentes autorizados.
- O sistema deve confirmar o armazenamento.

## 3. Regras de Negócio

**RN01:** O acesso às funcionalidades protegidas depende de autenticação prévia.

**RN02:** Os clientes podem criar, consultar, modificar e cancelar seus pedidos de aluguel.

**RN03:** Os agentes de empresas e bancos podem modificar e avaliar pedidos conforme suas permissões.

**RN04:** Os pedidos devem passar por análise financeira dos agentes antes de serem encaminhados para consideração quanto à execução do contrato.

**RN05:** Cada contratante pode possuir, no máximo, três entidades empregadoras, com seus respectivos rendimentos.

**RN06:** Os automóveis devem possuir matrícula, ano, marca, modelo e placa registrados.

**RN07:** A propriedade de um automóvel pode estar associada a um cliente, empresa ou banco, dependendo do contrato.

**RN08:** Um aluguel pode estar associado a um contrato de crédito concedido por um banco agente.

## 4. Requisitos Técnicos

- Back-end: Java J