# Revisão do portal Lucro na Rota

Testes executados em 19 de novembro de 2026 na branch `desenvolvimento/portal-lucro-na-rota`. A referência da calculadora foi o commit `ae399a99e66843337adc3198b0cbbf4d053c522d` da `main`. O HTML servido pelo GitHub Pages coincidiu byte a byte com o HTML desse commit.

## O que está pronto

- Página inicial responsiva com a calculadora em destaque, chamada da primeira reportagem e área de ferramentas.
- Calculadora em `/calculadora/` com veículo próprio e alugado, opções de combustível e energia, custos fixos, custos por km, depreciação, consertos, resultado negativo e cópia do resumo.
- Arquivo em `/noticias/` com uma matéria. A reportagem tem página própria, sumário, nota editorial e chamada para a calculadora. O [modelo reutilizável](../modelo-de-reportagem.md) explica como ampliar o arquivo e as categorias.
- Páginas Sobre, Critérios editoriais e Privacidade, com navegação por teclado, links no rodapé, metadados, URLs canônicas e sitemap.
- Armazenamento local compatível com os perfis anteriores, botão para apagá-los e validação de entradas decimais, campos aplicáveis e resultados numéricos finitos.

## Capturas

Páginas completas capturadas em Chromium, com 1.440 px de largura no desktop e 390 px na emulação de celular. A calculadora aparece preenchida com valores de exemplo.

| Página | Desktop | Celular |
| --- | --- | --- |
| Início | [Abrir captura](inicio-desktop.webp) | [Abrir captura](inicio-celular.webp) |
| Calculadora | [Abrir captura](calculadora-desktop.webp) | [Abrir captura](calculadora-celular.webp) |
| Reportagem | [Abrir captura](reportagem-desktop.webp) | [Abrir captura](reportagem-celular.webp) |

## Resultado dos testes

| Verificação | Resultado |
| --- | --- |
| Linha de base, antes da migração | 24 cenários aprovados usando o código original. |
| Regressão da calculadora | 66 verificações aprovadas em 3 grupos de teste. Incluem 24 cenários no original, 24 na versão integrada, 11 comparações exatas de resultados e resumo, e 7 verificações específicas da integração. |
| Cálculo e cópia em Chromium | Mesmo resultado e mesmo texto copiado no cenário original e no integrado. Para R$ 200,00 de faturamento, 100 km, 8 horas, gasolina, custos mensais, depreciação e conserto, ambas as versões apresentaram R$ 158,50 de resultado estimado. |
| Veículo alugado e prejuízo | Alternância aprovada. Um cenário sem faturamento, com R$ 65,00 de aluguel diário, R$ 7,00 de outras despesas e R$ 15,00 de combustível apresentou −R$ 87,00. |
| Persistência e exclusão em Chromium | Perfil antigo carregado na rota nova no mesmo domínio. Recarregamento manteve as configurações fixas e esvaziou os números do dia. Cancelamento preservou o perfil. A confirmação excluiu os perfis, manteve o dia em edição e refletiu a exclusão em outra aba. |
| Navegação e arquivos | 7 páginas, 155 referências e 20 destinos únicos validados com o prefixo `/calculadora-entregadores/`. No navegador, os fluxos da chamada da calculadora, do arquivo, da reportagem e do menu compacto passaram. |
| Responsividade e acessibilidade | 7 páginas testadas em 320, 390, 768 e 1.440 px. Sem transbordamento horizontal detectado. O link de salto levou o foco ao conteúdo. Escape fechou o menu compacto e devolveu o foco ao botão. O axe-core não apontou violações nas regras automatizadas WCAG 2.0 e 2.1 A/AA executadas. |
| Carregamento | O teste navegável não encontrou recursos 404, erros de execução, erros de console ou solicitações fora da origem. A variante móvel da foto de abertura tem 91 KiB. As duas fontes locais somam 58 KiB e o CSS e JavaScript comuns somam 12 KiB, antes da compressão HTTP. A imagem do card abaixo da abertura usa carregamento adiado e as imagens têm dimensões declaradas. |
| Segurança e privacidade | Recursos servidos pela própria origem. A política de segurança de conteúdo restringe scripts e demais recursos à origem, bloqueia conexões de scripts e submissões de formulários, e dispensa código inline. Foi verificado que a calculadora guarda somente o perfil fixo e oferece a exclusão desse perfil. |
| Conteúdo | A reportagem apresenta o projeto, os custos do trabalho e a proposta editorial. Guarulhos é descrita como ponto de partida, sem números de audiência ou parcerias. As imagens são ilustrações originais geradas para esta revisão. |
| GitHub Pages | O provedor confirmou a raiz da branch `main` como origem, com HTTPS obrigatório. O site público respondeu via HTTPS com a calculadora original. |

## Como repetir os testes

Em um clone com o histórico Git, execute `node tests/calculadora.mjs`. Para rodar somente a linha de base, acrescente `--original`. Execute `python3 tests/navegacao.py` para conferir as referências e as rotas estáticas. O [README](../../README.md) inclui um roteiro curto de revisão manual.

## Limites e pendências

- A prévia interativa retornou erro de encaminhamento. Os testes e as capturas em Chromium usaram os arquivos reais da branch com o prefixo do GitHub Pages em um ambiente de teste isolado. Os tempos de carregamento em rede real, a experiência em um aparelho físico e a nova versão na hospedagem definitiva ficam para a conferência de lançamento.
- A data editorial de 19/11/2026 é proposta para revisão. A confirmação da data, a aprovação do conteúdo e a publicação do portal com a calculadora e a reportagem ficam para a etapa seguinte.
- Planilha, comunidade, anúncios e recursos premium são possibilidades de expansão. As próximas matérias entram no arquivo conforme forem produzidas.
