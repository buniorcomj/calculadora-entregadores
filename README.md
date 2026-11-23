# Lucro na Rota

Portal especializado em delivery de refeições, com uma calculadora gratuita de resultado diário também para quem entrega encomendas ou transporta passageiros, além de uma área de notícias e dicas. O projeto parte de Guarulhos (SP) e atende quem roda de moto, carro ou bicicleta pelo Brasil.

Esta versão está na branch de revisão `desenvolvimento/portal-lucro-na-rota`. O endereço público é servido por HTTPS no GitHub Pages a partir da branch `main`. A publicação do portal depende da aprovação do proprietário. [Endereço público atual](https://buniorcomj.github.io/calculadora-entregadores/)

## Abra a versão de revisão

Extraia o ZIP do código ou abra a pasta da branch de revisão. No terminal, entre na pasta que tem o arquivo `index.html` e execute, com Python 3.9 ou mais recente:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra [http://localhost:8000/](http://localhost:8000/) no navegador. Para encerrar a prévia, volte ao terminal e pressione `Ctrl+C`. O site é estático e funciona com os arquivos da pasta, sem instalar pacotes ou contratar serviços.

## Confira o portal em 5 a 10 minutos

1. Abra **Início**, veja o destaque e siga o botão para a **Calculadora**. Depois use o menu para voltar e abra **Notícias e Dicas**, leia a reportagem e confira os links do rodapé.
2. Na calculadora, selecione **Veículo próprio** e **Bicicleta comum**. Em uma sessão com configurações vazias, informe R$ 40 de faturamento, 30 km e 2 horas. O resultado estimado deve ser R$ 40,00 e R$ 20,00 por hora. Use **Copiar resumo do dia** e cole em um editor de texto.
3. Passe para **Veículo alugado** e escolha a bicicleta. Coloque R$ 15,50 de aluguel por dia e R$ 2,50 de outros gastos do dia. Com os mesmos dados da jornada, o resultado deve ser R$ 22,00. Recarregue a página. Confira o aluguel salvo, preencha os dados da jornada novamente e experimente **Apagar configurações salvas**.
4. Reduza a largura da janela ou ative a visualização de celular do navegador. Confira se consegue abrir o menu, ler a reportagem e preencher a calculadora sem rolar para os lados.
5. Se encontrar algo para ajustar, informe a página, o aparelho ou navegador, as ações realizadas e o que apareceu. Uma captura de tela com valores fictícios ajuda a localizar o problema.

## Repita os testes automáticos

Rode os comandos na pasta do projeto. A verificação de navegação usa Python 3.9 ou mais recente. A comparação financeira usa Node.js 18 ou mais recente e precisa de uma cópia Git com o histórico original, pois lê a versão anterior direto de um commit. O ZIP do código já permite rodar a verificação de navegação e revisar tudo no navegador.

```sh
python3 tests/navegacao.py
node tests/calculadora.mjs
```

O [relatório de revisão](docs/revisao/relatorio.md) registra os testes executados e as pendências. O [modelo de reportagem](docs/modelo-de-reportagem.md) mostra como adicionar matérias ao arquivo e ao sitemap.

## Antes de publicar

- Revise a branch e aprove o conteúdo, a identidade visual e a calculadora. Combine a data de lançamento antes de qualquer alteração em `main`.
- A primeira reportagem usa **19/11/2026** como data proposta. Na publicação aprovada, registre a data efetiva na matéria, nos metadados e no card do arquivo.
- Após a integração autorizada em `main`, confira o endereço público em HTTPS, incluindo a rota `/calculadora/` dentro do prefixo `/calculadora-entregadores/`.
- Planilha, comunidade, anúncios, contas e pagamentos ficam para futuras etapas. A hospedagem atual atende esta revisão com custo adicional de R$ 0.

## Onde ampliar o portal

Adicione a planilha à seção **Ferramentas** quando o download estiver pronto. Se houver publicidade aprovada depois da revisão de privacidade, o espaço pode entrar como um novo bloco entre **Notícias e dicas** e **Ferramentas** na página inicial, ou depois do corpo de uma reportagem. A calculadora tem rota própria, fora desses pontos de inserção.
