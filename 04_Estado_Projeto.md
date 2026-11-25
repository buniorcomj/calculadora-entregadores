# Estado do projeto

## Revisão técnica — 25/11/2026

- Moderação confirma ações aplicadas, sinaliza ações que ficaram inválidas e preserva identificadores de comentários excluídos contra reuso. O teste integrado com Cloudflare continua pendente de autorização e configuração de Workers, D1, Turnstile, Access e hostname HTTPS.
- As duas calculadoras passaram em cenários de uso no Chromium em 320, 390, 768 e 1.440 px. As fórmulas e a proteção de dados permanecem iguais. Passaram 82 testes automatizados e a navegação das 10 páginas.
- O modelo HTML reutilizável inclui campos para a redação aprovada, imagem, fontes e comentários. O conteúdo das reportagens existentes foi preservado.

## Sequência editorial de lançamento — 25/11/2026

- A capa e o arquivo de notícias seguem a ordem aprovada: apresentação do portal, tutorial da calculadora financeira e tutorial Aplicativo x CLT.
- Os textos de reservas e direitos trabalhistas ficam em `docs/arquivo-editorial/` como fontes para futuras matérias, fora das rotas e do sitemap de lançamento.
- Os tutoriais preservam os comentários desativados por padrão. A homologação da Cloudflare, a revisão editorial e as datas de publicação continuam pendentes.

## Comentários moderados — 25/11/2026

- Implementação na branch de desenvolvimento com comentários por matéria, fila de aprovação e painel de moderação protegido pelo Cloudflare Access.
- Fluxo validado em testes com banco isolado. A prévia HTTPS do portal conserva o recurso desativado e as duas calculadoras continuam isoladas.
- Pendente para concluir a tarefa #1: autorizar a configuração de homologação na Cloudflare e testar o fluxo integrado por HTTPS. As etapas estão na [especificação de comentários](docs/comentarios-moderacao.md).

## Fechamento do dia — 23/11/2026

- **Versão de revisão.** Os 28 arquivos do site na prévia HTTPS privada coincidem com o commit `a308ffd` na branch `desenvolvimento/portal-lucro-na-rota`. A prévia exige login e o site público segue na versão anterior.
- **Concluído.** Calculadora de entregas e corridas com outros gastos do dia e referências de depreciação. Comparador Aplicativo x CLT com reservas separadas da renda comparável e equivalência econômica de jornada. Matérias sobre ganhos, gastos e reservas e sobre CLT versus aplicativo, além da apresentação do projeto. Correções de HTML, documentação de fórmulas e testes preservados.
- **Verificação.** Na versão de revisão, passaram 78 testes automatizados e a checagem de estrutura e navegação das 10 páginas, com 214 referências verificadas.
- **Para retomar em 24/11.** Revisar os cálculos de forma independente, testar as duas calculadoras no navegador e conferir privacidade, textos, links e ordem das matérias. Confirmar as datas editoriais e obter aprovação antes de qualquer publicação oficial.

## Revisão para lançamento — 23/11/2026

- Reportagem CLT com estrutura HTML corrigida e teste de fechamento de tags na navegação.
- Comparação e metas antes de reservas pessoais. Dinheiro disponível após reserva aparece em separado.
- Matéria sobre ganhos, gastos e reservas abre a seção editorial. A reportagem CLT vem em seguida. Datas de publicação serão registradas após aprovação.
- Ajuda de depreciação inclui referências externas e suas limitações.

## Aplicativo x CLT — 23/11/2026

- Calculadora independente e segunda reportagem prontas para revisão na branch de desenvolvimento. A calculadora de entregas e corridas mantém seus arquivos e fórmulas.
- Metodologia, fontes oficiais e cenários de teste em [Comparador Aplicativo x CLT](docs/comparador-aplicativo-clt.md). A versão definitiva aguarda aprovação.

## Ajustes para revisão — 23/11/2026

- A calculadora tem um campo opcional de outros gastos do dia para veículos próprios e alugados. O valor vale para a sessão e não é reaproveitado de perfis antigos.
- O portal apresenta delivery de refeições como especialidade e também atende entregas de encomendas e transporte de passageiros.
- A prévia na branch de desenvolvimento está pronta para aprovação. As 70 verificações da calculadora e a navegação das 7 páginas passaram.

## Revisão do portal — 19/11/2026

- **Fase.** Portal funcional na branch `desenvolvimento/portal-lucro-na-rota`, para revisão do proprietário. O endereço público continua a usar a versão da branch `main` no GitHub Pages.
- **Entrega.** Início, calculadora com identidade visual nova, arquivo de notícias, reportagem de apresentação, páginas Sobre, Privacidade e Critérios Editoriais e modelo para novas matérias.
- **Arquivos.** O portal ocupa `index.html`. As páginas ficam nas pastas correspondentes, os recursos compartilhados em `assets/` e os testes em `tests/`.
- **Verificação.** O [relatório de revisão](docs/revisao/relatorio.md) registra resultados, capturas e limites. O [README](README.md) explica como abrir a prévia e repetir as verificações.
- **Próxima etapa.** Revisar o protótipo e confirmar o conteúdo e a data de publicação antes de aprovar a atualização da versão pública. Acompanhar os itens do planejamento nas etapas seguintes.

## Registro de 30/10/2026

Atualizado em: 30/10/2026
Fase: planejamento concluído para a etapa de arquitetura; protótipo inicial existente; MVP 1.0 ainda não concluído.

## Confirmado
- Repositório: `buniorcomj/calculadora-entregadores` (ramo `main`), acessível pelo ChatGPT para leitura e escrita.
- Há protótipo em `index.html`, que calcula receita, combustível/energia, manutenção, resultado estimado por hora e por km para opções básicas de moto e bicicleta.
- Há `README.md` inicial e `TESTE_CONEXAO.md` com registro de teste de escrita em 29/10/2026.
- Documentação de planejamento de 29/10/2026 preparada: Projeto Mestre, Ata, Instruções do Codex e Estado do Projeto. O Projeto Mestre foi convertido de DOCX para Markdown sem alteração deliberada de requisitos, para leitura no GitHub.
- Método de trabalho inclui validação do proprietário e explicação de 5 a 10 minutos por etapa, focada em aprender a orientar o Codex (não a programar).

## Lacunas entre protótipo e MVP 1.0
- Ainda não estão implementados no protótipo os períodos dia/semana/mês, seleção completa de atividades e veículos, número de serviços, bônus/promos, metas, custos adicionais detalhados e resultado por serviço.
- O campo elétrico usa eficiência em km/kWh no protótipo, enquanto o planejamento define consumo em kWh/100 km; decidir e implementar a forma planejada na arquitetura, com testes.
- A aceitação de vírgula decimal, casos extremos e testes automatizados requer verificação/adequação.

## Pendente / não verificado
- Causa da falha de criação do ambiente Codex; ligação do Codex com o repositório continua não comprovada. Não confundir com permissão de leitura/gravação do ChatGPT no GitHub, já confirmada.
- Testes completos do código, arquitetura modular, hospedagem, regras de uso comercial gratuito, publicação e métricas.
- Pendências de produto já registradas no Projeto Mestre e na Ata; não rediscutir sem necessidade.

## Próxima tarefa única
Ler os quatro documentos e o `index.html` existente. Comparar o protótipo ao MVP aprovado, apresentar arquitetura mínima, testes e sequência de 4 a 6 entregas pequenas. **Não modificar o código antes de apresentar o plano e obter aprovação.** Diagnosticar o ambiente Codex separadamente quando houver cota disponível.

## Registro histórico
29/10/2026: documentação organizada em quatro arquivos. O estado anterior dizia que o repositório e o código não estavam verificados; ambos foram conferidos em 30/10/2026. Não houve implementação de MVP 1.0 nesta atualização documental.

## Modelo de atualização ao fim de cada sessão
Data:
O que foi feito:
Arquivos alterados:
Testes executados e resultado:
Decisões novas (registrar também na ata):
Problemas/risco:
Próximo passo único:

## Testes executados em 30/10/2026
- 20 verificações funcionais em navegador (Chromium), 18 aprovadas e 2 falhas ligadas a um mesmo defeito: bicicleta comum bloqueada por validação de campo de consumo oculto/vazio.
- Sem estouro horizontal detectado nas larguras 320 e 360 px; negativas bloqueadas; cenários básicos de cálculo aprovados.
- Divergência entre unidade elétrica do protótipo (km/kWh) e Projeto Mestre (kWh/100 km) confirmada.
- Vírgula decimal e comportamento em celulares/navegadores reais ainda precisam de validação.
- Relatório detalhado e instruções para regressão: `05_Relatorio_Testes_2026-10-30.md`.
- `index.html` não foi modificado nesta sessão.

## Decisão de interface registrada — 30/10/2026
- Troca de veículo mantém faturamento, km, horas e quantidade de serviços na simulação; preços de gasolina/etanol e tarifa elétrica R$/kWh permanecem associados à fonte de energia, não se apagam ao mudar veículo.
- Consumo é específico do tipo de veículo; os campos de entrada se adaptam sem perder outros valores. Haverá botão explícito "Novo cálculo" para limpar dados.
- Regras detalhadas no complemento de 30/10 do `01_Projeto_Mestre.md` e na ata. Pendentes de implementação e teste; `index.html` continua inalterado.

## Pendência levantada em 30/10/2026 — tarifa elétrica horária
- Confirmar futura especificação para tarifa convencional versus tarifa diferenciada por horário (ponta/intermediária/fora de ponta); período da **recarga** determina custo, não horário de trabalho.
- Tarifas e horários variam conforme distribuidora/modalidade; não codificar tabelas nacionais fixas. Prioridade entre MVP 1.0 e versão futura **a decidir**, sem alterar a especificação do MVP por suposição.
