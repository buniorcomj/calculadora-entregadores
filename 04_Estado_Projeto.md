# Estado do projeto
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
