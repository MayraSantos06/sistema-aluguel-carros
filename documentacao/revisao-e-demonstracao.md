# Revisão da modelagem e demonstração

## Evolução da modelagem

| Modelo inicial | Implementação |
|---|---|
| PedidoAluguel e StatusPedido | `Aluguel` e `StatusAluguel`. O pedido começa pendente. A avaliação conclui a análise com aprovação ou recusa, e o cancelamento encerra um pedido pendente. |
| Empresa, Banco e Agente | As contas são identificadas pelo login e pelo perfil `EMPRESA` ou `BANCO` em `Usuario`. |
| EntidadeEmpregadora | `Empregador` é um valor persistido em uma coleção ordenada vinculada ao cliente, com limite de três. |
| Avaliação, propriedade e contratos | Um pedido pode receber um parecer, um contrato e um crédito opcional. Os registros são armazenados no próprio aluguel. A decisão usa o status, e o contrato tem data e identificação do proprietário. |
| Pacotes de interface e segurança | As telas principais vivem em `App.tsx`. Os serviços HTTP ficam em `frontend/src/services`. O Spring Security é configurado no pacote `config`. |

O histórico do Git preserva os diagramas iniciais. Os diagramas atuais refletem as decisões acima.

## Roteiro da apresentação

1. Entre com a conta de empresa e cadastre um veículo de demonstração. Edite o modelo e confirme a atualização.
2. Crie uma conta de cliente, entre, consulte **Meu perfil**, preencha os dados e adicione um empregador com rendimento. Edite um campo e confirme a alteração ao voltar à tela. Para demonstrar a exclusão, use um perfil sem pedidos vinculados.
3. No catálogo, escolha o veículo, crie um pedido e abra **Meus aluguéis**. Verifique o identificador e o status inicial. Edite um pedido pendente e cancele outro. Entre novamente para conferir que os estados persistiram.
4. Entre como empresa ou banco, abra um pedido pendente, consulte o contratante e registre um parecer. Tente aprovar dois pedidos sobrepostos para o mesmo veículo e confira a rejeição do segundo.
5. Abra **Contratos**, formalize o pedido aprovado e registre a propriedade conforme o tipo de proprietário. Para empresa ou banco, informe o login de um agente cadastrado com esse perfil. Entre com a conta de banco para vincular um crédito opcional.
6. Volte aos detalhes do pedido na conta do cliente para conferir a decisão e o contrato. Compare o percurso com os diagramas e mostre as mudanças registradas na tabela acima.
