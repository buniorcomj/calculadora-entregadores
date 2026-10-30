Versão de planejamento 1.0 • 29/10/2026 • Documento para orientar
ChatGPT, Codex e proprietário do projeto

# 1. Objetivo e princípios

Criar uma ferramenta web gratuita no lançamento, acessível por celular,
para entregadores, motoristas de passageiros e outros profissionais
autônomos. Calcular rentabilidade, metas e custos, com evolução para
histórico financeiro e manutenção de veículos. Arquitetura reutilizável
para outros pequenos empreendedores, sem construir módulos não
necessários agora.

- Orçamento inicial de R\$ 0: não contratar planos, domínio, APIs pagas
  ou serviços com cobrança sem aprovação expressa.

- Lançar funcionalidade útil cedo; evoluir por uso real, feedback e
  custos observados.

- Interface simples, rápida, responsiva, em português do Brasil e
  acessível.

- Sem cadastro obrigatório e sem banco de dados no MVP; evitar coletar
  informações pessoais desnecessárias.

- Não prometer lucro contábil: mostrar resultado líquido estimado e
  custos considerados.

# 2. Público e veículos — lançamento

- Atividades: entrega, transporte de passageiros e outros serviços.
  Nomenclatura adaptável (entrega, corrida, serviço).

- Veículos: moto e carro a combustão, bicicleta convencional, bicicleta
  elétrica, moto/carro elétrico; oferecer também opção sem veículo.

- Para combustão: preço do litro e consumo km/L; para elétrico: tarifa
  R\$/kWh e consumo kWh/100 km; para bicicleta: custo energético zero,
  outras despesas possíveis.

- Campos podem ser ocultados conforme atividade e veículo; cálculos
  financeiros genéricos ficam independentes do tipo.

# 3. MVP 1.0 — funcionalidades obrigatórias

- Entradas: período (dia, semana, mês), faturamento de serviços, número
  de serviços, horas, km, despesas adicionais, tipo de veículo e
  parâmetros de energia.

- Promoções: bônus fixo, adicional por serviço e bônus condicionado à
  quantidade; rótulos de chuva, horários, dias e campanhas; registrar
  previsto separadamente do efetivamente conquistado.

- Metas: alvo de resultado líquido; progresso, quanto falta, estimativa
  de serviços restantes usando média observada com ressalvas de custos
  adicionais.

- Saídas: receita total, bônus realizados, custos energéticos, outras
  despesas, resultado líquido estimado, receita/serviço, resultado/hora
  e resultado/km.

- Períodos semanais e mensais serão cálculos sobre totais inseridos
  manualmente, NÃO histórico automático de dias.

- Permitir campos de custo zero; validar divisões por zero, valores
  inválidos, ausência de dados, números decimais com vírgula.

- Promoções condicionais não entram em ganhos realizados antes de
  atingir as condições; previsão e realizado devem ser visualmente
  distintos.

# 4. Fórmulas e regras

- Custo combustível = km / consumo_km_por_litro × preço_litro (se
  consumo \> 0).

- Custo eletricidade = km × consumo_kWh_por_100km / 100 ×
  tarifa_R\$/kWh.

- Receita realizada = receita dos serviços + bônus conquistados;
  projeções exibidas separadamente.

- Resultado líquido estimado = receita realizada − custo de energia −
  outras despesas informadas.

- Resultado por hora = resultado / horas; resultado por km = resultado /
  km; média bruta por serviço = receita realizada / quantidade.

- Meta restante = max(0, meta líquida − resultado). Estimativas de
  corridas restantes exigem hipótese explícita sobre ganho incremental e
  custos, nunca falsa precisão.

- Não somar bônus duas vezes: perguntar se o faturamento informado já
  inclui promoções ou separar claramente as entradas.

# 5. Roadmap sujeito à validação

## 1.0 Lançamento

Calculadora diária/semanal/mensal; veículos; promoções; metas;
resultado/hora, por km e por serviço; testes e publicação.

## 1.1 Refinamentos

Configurações salvas localmente; simulador gasolina × etanol e decisões;
melhorias de bônus e comparações.

## 1.2 Histórico

Registros por dia, relatórios semanais/mensais, exportação e backup.
Dados locais primeiro, com alerta de risco ao limpar navegador.

## 1.3 Livro de manutenção

Registro de serviços preventivos/corretivos, datas, odômetro, peças,
óleo, custos e anexos apenas se viáveis.

## 1.4 Alertas

Manutenção próxima/vencida por km e/ou data; alertas dentro do site;
notificações externas somente se viáveis.

## 1.5 Gestão financeira

Reservas, pró-labore/retirada, custos fixos, depreciação e análise de
rentabilidade.

## 2.0 Expansão

Base de recomendações oficiais por montadora/modelo/ano, sincronização
opcional, integrações, monetização e adaptação a outros negócios.

# 6. Segurança e precisão em manutenção

- Distinguir uso comum e severo; explicar que o uso profissional
  frequente pode se enquadrar como severo conforme o manual específico.

- Não inferir intervalo de troca somente por óleo mineral,
  semissintético ou sintético; especificações e intervalos dependem do
  manual, modelo, ano e condições.

- Até existir base verificada de fabricantes, usuário configura
  intervalos; citar fonte e data quando houver recomendações oficiais.

- Manutenção corretiva é registrada quando ocorre; alertas preditivos,
  quando existirem, são estimativas e não diagnóstico.

# 7. Arquitetura solicitada ao Codex

- Aplicação web estática no MVP; separação entre UI, domínio financeiro,
  configurações de atividade/veículo, regras de promoções e persistência
  futura.

- Modelo genérico de atividade e serviço; regras de veículos e de bônus
  extensíveis, sem condicionais espalhadas pela interface.

- Cálculos como funções puras testáveis; testes para casos normais e
  limites; acessibilidade e responsividade.

- Sem banco de dados, autenticação, APIs externas, analytics invasivo ou
  dependências desnecessárias na primeira entrega.

- Preparar migração de dados e versionamento do formato antes de salvar
  histórico; nunca assumir que armazenamento local é backup.

- README em linguagem simples: executar, testar, publicar, atualizar,
  voltar versão anterior e custos/limites.

- Evitar superengenharia: não construir módulos futuros, apenas
  preservar pontos de extensão razoáveis.

# 8. Hospedagem, repositório e custo

GitHub para código e histórico. Como o proprietário já possui login na
Vercel, avaliar Vercel e Cloudflare Pages antes da publicação. Verificar
termos atuais de uso comercial, limites gratuitos e eventuais
restrições; NÃO presumir que um plano pessoal gratuito autoriza
monetização. Preferir serviço que permita uso pretendido sem custo; se
não houver, manter protótipo local até solução gratuita compatível.
Nenhuma contratação sem autorização.

# 9. Monetização e métricas

- Calculadora essencial gratuita no lançamento. Não definir paywall
  antes de medir uso e retorno.

- Possibilidades: links afiliados claramente identificados, publicidade
  após aprovação, recursos avançados opcionais e ferramentas para outros
  segmentos.

- Métricas mínimas agregadas: visitas, retorno, funções utilizadas e
  feedback; implantar com transparência, consentimento quando aplicável
  e atenção à LGPD.

- Avaliar receita real versus custos e experiência do usuário antes de
  anúncios, assinaturas ou infraestrutura paga.

# 10. Método de trabalho: usuário, ChatGPT e Codex

- ChatGPT: priorizar, especificar, explicar e revisar; Codex:
  implementar, testar e documentar; usuário: validar funcionamento e
  aprovar decisões.

- Trabalhar em pequenas etapas; antes de codificar, Codex apresenta
  plano, arquivos envolvidos, testes e eventuais custos.

- Após cada etapa: demonstrar resultado, explicar em linguagem simples o
  que mudou e como testar; pedir aprovação antes de avançar.

- Reservar explicações curtas (5–10 min) para o usuário aprender a
  orientar o Codex, não exigir curso de programação.

- Não apagar trabalho, alterar hospedagem, instalar serviços pagos nem
  publicar dados sensíveis sem aprovação.

- Manter changelog e lista de ideias futuras; novas ideias são avaliadas
  por valor, esforço, risco e dependências.

# 11. Primeira tarefa a entregar ao Codex

Leia este documento integralmente. NÃO implemente o sistema completo
agora. Primeiro proponha uma arquitetura mínima para o MVP 1.0,
estrutura de pastas, tecnologias gratuitas, fórmulas, estratégia de
testes e sequência de 4 a 6 pequenas entregas. Aponte ambiguidades
relevantes e riscos de hospedagem comercial gratuita. Explique tudo em
português simples para uma pessoa sem experiência em programação.
Aguarde aprovação antes de escrever o primeiro módulo.

# 12. Decisões pendentes (não bloqueiam a arquitetura)

- Nome comercial e identidade visual da ferramenta.

- Qual a forma mais simples de entrada dos totais semanal/mensal para
  evitar duplicação.

- Escolha final de hospedagem após verificação de termos e limites.

- Como obter feedback de usuários sem coletar dados pessoais
  desnecessários.