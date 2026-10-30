# Relatório de testes do protótipo — 30/10/2026

## Escopo e origem
- Arquivo testado: `index.html`, commit/objeto Git (blob) SHA `c558069f9480d4189722f01d88eafd6fa1f596bc`, confirmado como idêntico ao arquivo HTML anexado pelo proprietário.
- Teste funcional automatizado em Chromium com Playwright, sem alterar o código do projeto e sem acessar Work/Codex.
- Comparação de requisitos com `01_Projeto_Mestre.md` e `02_Ata_Decisoes.md`.

## Resultado inicial
Foram realizadas 20 verificações no fluxo principal, das quais 18 passaram e 2 falharam. As duas falhas são manifestações de um mesmo defeito.

### Aprovados no cenário testado
- Valores iniciais: faturamento R$ 200, km 100, consumo 40 km/L, combustível R$ 6/L e manutenção R$ 0,15/km -> combustível R$ 15, manutenção R$ 15, resultado estimado R$ 170, resultado/h R$ 21,25, resultado/km R$ 1,70.
- Cenário 2: faturamento R$ 160, km 80, consumo 40 km/L, combustível R$ 5,80/L, manutenção R$ 0,15/km, 7 h -> combustível R$ 11,60, manutenção R$ 12, resultado R$ 136,40, resultado/h R$ 19,49.
- Custos zero permitidos e ausência de divisão por zero em quilometragem/horas nos cenários testados.
- Bloqueio para consumo zero com distância positiva e mensagem de erro visível.
- Bicicleta comum sem custo de combustível quando campos obrigatórios estão preenchidos.
- Campos de energia são ocultados ao escolher bicicleta comum.
- Cálculo elétrico do código atual confirmado: energia em km/kWh (100 km a 30 km/kWh e R$ 1/kWh = R$ 3,33), **mas unidade diferente da especificação**.
- Não foram encontrados erros fatais de JavaScript nos cenários executados.

### Falha reproduzida (prioridade alta para o MVP)
1. Selecionar moto a combustão; limpar o campo consumo; trocar para bicicleta comum.
2. O consumo fica oculto, mas é validado, impedindo a calculadora de exibir resultado.
3. A tela mostra erro e resultado “—”, embora bicicleta comum não dependa desse campo.
Critério de aceitação: campos ocultos/inaplicáveis não podem impedir o cálculo.

### Pontos adicionais de revisão
- **Elétricos:** documento mestre exige consumo em **kWh/100 km**, mas o protótipo solicita **km/kWh**. Ajustar entrada, cálculo e testes de acordo com o planejamento.
- **Vírgula decimal:** o teste automatizado não conseguiu preencher vírgula em campo HTML `type=number`; comportamento manual em diferentes navegadores e dispositivos **ainda precisa ser validado**.
- **Horas ou km zero:** apresenta R$ 0,00 por hora/km em vez de “não aplicável”; considerar clareza antes do lançamento.
- **Layout:** sem transbordamento horizontal aparente nos testes de largura 320 e 360 pixels.
- **Receita negativa:** bloqueada pelo validador no cenário testado.
- **Funcionalidades 1.0 ausentes:** seleção completa de atividades/veículos, períodos manuais, serviços, despesas adicionais, metas, bônus e rentabilidade por serviço. Isso é escopo pendente, não erro do protótipo.
- São testes iniciais; não demonstram cobertura completa, compatibilidade universal de navegadores nem prontidão para publicação.

## Próxima tarefa recomendada
Antes de modificar o HTML, apresentar arquitetura mínima, separar regras de cálculo testáveis e ordenar correções/implementação do MVP em 4–6 entregas, obtendo aprovação do proprietário. Registrar testes automatizados repetíveis para evitar regressões.

## Aprendizado do proprietário — exemplo
`Cenário -> valor esperado -> valor obtido -> aprovado/reprovado`.
Perguntar ao Codex: “Quais cenários você testou, quais falharam, o que mudou, e como posso conferir no meu celular?”.
