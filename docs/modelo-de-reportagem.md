# Modelo de reportagem

Use [`noticias/apresentacao.html`](../noticias/apresentacao.html) como arquivo-base. Assim, a página nova herda o cabeçalho, o rodapé e os estilos que já funcionam no celular.

1. Copie o arquivo em `noticias/` e escolha um nome curto em minúsculas, com hífens entre as palavras. Use o caminho completo em `<link rel="canonical">` e `og:url`, incluindo o prefixo `/calculadora-entregadores/`.
2. Atualize `<title>`, `description`, `og:title`, `og:description` e `og:image:alt`. Com a data confirmada, atualize `<time datetime="AAAA-MM-DD">`, o texto visível e `article:published_time`.
3. Coloque a imagem própria ou licenciada em `assets/imagens/`. Use o caminho relativo no `<img>` e a URL absoluta em `og:image`. Descreva a imagem no `alt`, informe as dimensões do arquivo e identifique imagem ilustrativa ou crédito na legenda, conforme o caso. Atualize o `srcset` se houver uma versão menor.
4. Atualize o último item da trilha de navegação. Use a categoria e os subtítulos para orientar a leitura e mantenha os parágrafos curtos. Os subtítulos podem ter `id` para navegação dentro do texto. Ao usar o índice lateral, confira se cada `href="#..."` corresponde ao `id` de um subtítulo.
5. Inclua referências quando ajudarem o leitor a conferir fatos ou recomendações. Cite a fonte junto da afirmação ou reúna as referências no fim. Quando a recomendação depender de data, local, modelo ou condições de uso, registre o recorte na matéria.
6. Inclua links de matérias relacionadas quando elas estiverem disponíveis. Adicione o card da nova publicação à lista em [`noticias/index.html`](../noticias/index.html), atualize `sitemap.xml` e confira o funcionamento dos endereços com o prefixo do repositório.

## Estrutura do conteúdo

Troque o conteúdo de `<article>` no arquivo-base e conserve o restante da página. O bloco de referências e os links de matérias relacionadas entram conforme o conteúdo disponível. O destaque e a chamada da calculadora também podem ser adaptados à pauta.

```html
<article>
  <header class="story-header">
    <p class="editorial-topic">Categoria</p>
    <h1>Título da reportagem</h1>
    <p class="story-deck">Subtítulo que explica a pauta.</p>
    <p class="story-byline">Autoria <span aria-hidden="true">·</span>
      <time datetime="AAAA-MM-DD">Data de publicação</time>
    </p>
  </header>

  <figure class="story-figure">
    <img src="../assets/imagens/foto.webp" alt="Descrição da imagem" width="1200" height="800" decoding="async">
    <figcaption>Legenda e crédito da imagem.</figcaption>
  </figure>

  <div class="story-layout">
    <div class="editorial-prose">
      <p>Abertura que situa o leitor.</p>
      <h2 id="assunto">Subtítulo explicativo</h2>
      <p>Contexto e apuração em parágrafos curtos.</p>
      <aside class="editorial-note" aria-label="Ponto principal">
        <p>Informação que vale destacar.</p>
      </aside>
      <section aria-labelledby="fontes">
        <h2 id="fontes">Referências</h2>
        <ul><li><a href="URL-DA-FONTE">Título e identificação da fonte</a></li></ul>
      </section>
      <section aria-labelledby="relacionadas">
        <h2 id="relacionadas">Leia também</h2>
        <ul><li><a href="./outra-materia.html">Título da matéria relacionada</a></li></ul>
      </section>
    </div>

    <aside class="story-contents" aria-labelledby="nesta-reportagem">
      <h2 id="nesta-reportagem">Nesta reportagem</h2>
      <ul><li><a href="#assunto">Subtítulo explicativo</a></li></ul>
    </aside>
  </div>

  <footer class="editorial-cta">
    <div>
      <h2>Faça a conta do seu dia</h2>
      <p>Confira quanto sobra com seus próprios valores.</p>
    </div>
    <a class="editorial-button" href="../calculadora/">Abrir calculadora grátis</a>
  </footer>
</article>
```

## Categorias previstas

- Manutenção e segurança
- Dinheiro e economia
- Aplicativos e trabalho
- Notícias relevantes
- Voz do Entregador
- Guarulhos e outras regiões

A categoria entra no card e na matéria. A lista começa com os conteúdos publicados e pode ganhar filtros de categoria conforme o arquivo crescer.

## Comentários

Copie o bloco de comentários do arquivo-base e substitua o valor de `data-comentarios` pelo identificador estável da matéria. Use até 80 caracteres, com letras minúsculas, números e hífens. Não reutilize identificadores de outras matérias. Preserve esse valor se mudar o título ou endereço para manter a discussão associada.
