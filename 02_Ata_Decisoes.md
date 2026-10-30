# Ata de planejamento — 29/10/2026

## Objetivo
Criar calculadora web gratuita de rentabilidade para entregadores, motoristas de passageiros e outros autônomos, com custo inicial R$ 0, possível monetização futura e arquitetura adaptável a outros negócios.

## Decisões confirmadas
- Gestão e planejamento com ChatGPT; implementação pelo Codex; proprietário testa e aprova. Janela normal para Codex (logins GitHub/Vercel), anônima para ChatGPT.
- Primeira versão: atividade, moto/carro/bicicleta/elétricos, dia/semana/mês por totais manuais, ganhos, quantidade de corridas/entregas, km, horas, combustível/energia, outras despesas, metas, lucro estimado por hora/km/serviço.
- Promoções desde o lançamento: fixas, por serviço e condicionadas à quantidade; chuva, horários, dias e campanhas como etiquetas; separar bônus previstos e conquistados; evitar duplicação.
- Sem login, banco de dados ou integração automática com aplicativos no MVP.
- Roadmap: 1.1 preferências/simulações; 1.2 histórico/exportação/backup; 1.3 livro de manutenção; 1.4 alertas; 1.5 retirada/pró-labore, depreciação e reservas; 2.0 integrações, montadoras e expansão.
- Manutenção: uso comum/severo, mas intervalos não devem ser inferidos apenas do tipo de óleo; quando possível, basear recomendações em manuais oficiais por modelo e ano.
- Monetização só após validar visitas, recorrência, utilidade e custos: publicidade, afiliados, funcionalidades avançadas. Não fixar paywall agora.
- Hospedagem: GitHub para código; avaliar Cloudflare Pages e Vercel com termos e limites atuais, especialmente uso comercial. Nenhum gasto sem autorização.
- Aprendizado paralelo: explicações simples de 5 a 10 minutos por etapa; foco em orientar e conferir Codex, sem exigir curso de programação.
- O projeto deve ser modular e reaproveitável em outros segmentos sem construir sistemas extras agora.

## Pendências
- Nome e identidade visual; hospedagem final; estratégia de métricas respeitando privacidade; entrada semanal/mensal; validação com usuários; definição de critérios para funções pagas.

## Regra de documentação
Registrar novas decisões nesta ata, atualizar o Projeto Mestre quando mudarem requisitos e atualizar o Estado do Projeto após cada sessão de implementação. Não apagar decisões antigas; marcar como substituídas, com data e motivo.

## Decisões de funcionamento — 30/10/2026
- Aprovado manter os dados de trabalho (receita, km, horas e quantidade) ao trocar de veículo; a troca serve também para comparação, sem reinicialização automática.
- Aprovado manter os preços informados independentemente do veículo que usa a mesma fonte de energia: valor do litro por combustível (gasolina/etanol) para moto/carro e tarifa R$/kWh para veículos elétricos, inclusive bicicletas elétricas. Consumo continua específico do veículo.
- A tarifa elétrica já constava do Projeto Mestre, mas seu comportamento na troca de veículo foi explicitado nesta decisão.
- Prever botão "Novo cálculo" para limpeza intencional dos dados. Persistência entre visitas continua reservada ao roadmap 1.1.
- Esta é uma especificação aprovada; ainda não representa implementação no protótipo `index.html`. Sem alteração no código nesta data.

## Esclarecimento sobre energia elétrica — 30/10/2026
- O proprietário levantou a **tarifação elétrica por horário do dia (ponta/intermediário/fora de ponta)** para veículos elétricos. Isso é diferente da decisão anterior de conservar o valor da tarifa R$/kWh ao trocar o tipo de veículo.
- A forma de cálculo e a prioridade (MVP 1.0 ou atualização posterior) ainda **não foram aprovadas**. Manter como questão em aberto sem sobrepor a ordem de versões aprovada.
- Referência: ANEEL Tarifa Branca e Postos Tarifários.
