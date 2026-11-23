# Aplicativo x CLT

Referência jurídica conferida em 23/11/2026. Folha projetada com os parâmetros do ano-calendário de 2026 mantidos constantes ao longo dos 12 meses. O código de referência está em `assets/js/regras-clt.mjs`. Atualize as tabelas, a competência aceita no formulário e os cenários de teste juntos quando mudar a vigência. A regra geral de jornada serve de contexto e não recalcula horas pagas automaticamente.

## Tempo e aplicativo

- Permanência é fim menos início. Se o turno atravessa meia-noite, some 24 horas ao fim. Horários iguais não representam 24 horas.
- Tempo dedicado é permanência menos almoço e pausas livres. Horas efetivas são tempo dedicado menos espera em disponibilidade. As horas excedentes do aplicativo são a diferença positiva entre suas horas dedicadas semanais e a jornada contratual CLT, para comparação econômica.
- Dias ativos no ano = 12 × dias do mês típico − dias de férias sem receita − outros dias sem trabalhar. Informe só dias de trabalho que foram perdidos. A semana típica serve para estimar horas e o equivalente por semana trabalhada, sem multiplicar a mesma semana por 52 na projeção anual.
- Resultado operacional diário = faturamento − custos informados. Resultado operacional anual = resultado diário × dias ativos + bônus anuais ainda não incluídos. Renda comparável anual = operacional anual − 12 × (INSS ou DAS, seguro e outros tributos mensais). Disponível anual = renda comparável anual − 12 × reserva mensal. A comparação e as metas usam renda antes de reservas pessoais em ambos os lados. Informe os valores previdenciários e tributários que se aplicam à sua atividade.
- O disponível por dia divide o total anual pelos dias ativos. Por semana trabalhada, multiplica essa média pelos dias da semana típica. A média mensal divide por 12. Por hora, divide pelas horas anuais do tipo escolhido.

## Folha CLT

- Use salário-base de empregado mensalista com um vínculo. Hora extra paga = (horas apuradas − compensadas) × (salário-base ÷ divisor) × (1 + adicional). O divisor padrão é 5 × jornada semanal e pode ser informado conforme a folha. Em casos em que outros adicionais integram a base de horas extras ou há categorias especiais, use a mesma base efetiva ajustando o divisor equivalente ou confira a folha à parte.
- DSR variável estimado = valor das extras pagas × repousos e feriados ÷ dias úteis. Para regras específicas, desative a estimativa e informe o valor apurado. O salário mensal já remunera o descanso ordinário. No bruto mensal entram salário-base, extras pagas, DSR variável e demais adicionais tributáveis informados. A duração do plantão não determina o pagamento de extras por si só.
- INSS progressivo por faixa até o teto. IRRF usa a maior dedução entre simplificada e legais informadas (INSS, dependentes e demais deduções). Aplica a tabela sobre a base após deduções e a redução de 2026 sobre rendimento tributável bruto. Retenções são arredondadas a centavos. A projeção de IRRF não calcula o ajuste da declaração anual.
- Cada um dos blocos recebe seus próprios INSS e IRRF. Ano líquido = 11 folhas normais líquidas + férias gozadas com o terço e os descontos informados + 13º líquido. Na falta de bases específicas, usa-se a remuneração mensal simulada como aproximação da média. A folha real pode ter médias, rubricas e incidências diferentes. A simulação não inclui abono de férias, rescisão, jornadas parciais no ano nem vínculos simultâneos.
- FGTS do empregado padrão: 8% do bruto sujeito a depósito (11 folhas, férias gozadas com terço e 13º), demonstrado à parte. Benefícios anuais = soma do VR, VA, VT e outros × meses equivalentes com benefício. Coparticipações entram em outros descontos. Use apenas benefícios cujo valor de uso quer comparar.

## Comparação e metas

- Projeção CLT em tempo equivalente = (líquido anual, com ou sem benefícios) ÷ horas dedicadas CLT no ano × horas dedicadas ao aplicativo no ano. Assume taxa por hora constante e deixa o FGTS fora. É equivalência econômica, sem apuração de horas extras legais.
- Meta anual de faturamento regular no aplicativo = máximo entre zero e (valor CLT de referência + custos diários do veículo × dias ativos + despesas anuais − bônus extras). Meta diária divide pelos dias ativos. Essas metas supõem custos por dia e despesas informadas constantes.

## Fontes e testes

- [INSS e Portaria MPS/MF nº 13/2026](https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal)
- [Receita Federal, competência 2026](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026) e [Lei 15.270/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm)
- [EC 141/2026](https://legis.senado.leg.br/norma/44184944) e [cautelares das ADIs 8.041 e 8.042](https://noticias.stf.jus.br/postsnoticias/stf-mantem-regra-de-transicao-para-implementacao-da-jornada-5x2/)
- [CLT](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm), [Lei do repouso semanal](https://www.planalto.gov.br/ccivil_03/leis/l0605.htm), [Lei do 13º](https://www.planalto.gov.br/ccivil_03/leis/l4090.htm) e [Lei do FGTS](https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm)

Execute `node --test tests/comparador.mjs`, `node tests/calculadora.mjs` e `python3 tests/navegacao.py`. No navegador, abra **Aplicativo x CLT**, compare os turnos iniciais de 12 e 10 horas e depois mude a espera. Confira que o tempo efetivo muda e o dedicado permanece. Nas opções avançadas, registre um benefício e confira as metas com e sem esse valor.
