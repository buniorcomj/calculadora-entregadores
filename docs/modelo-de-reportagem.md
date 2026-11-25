# Modelo de reportagem

Copie o [modelo HTML completo](modelo-de-reportagem.html.txt) para `noticias/SLUG.html`. O modelo usa cabeçalho, rodapé, estilos e seção de comentários do portal. Substitua os marcadores em maiúsculas apenas pelo material editorial aprovado.

1. Copie o arquivo em `noticias/` e escolha um nome curto em minúsculas, com hífens entre as palavras. Use o caminho completo em `<link rel="canonical">` e, se incluir metadados de compartilhamento, em `og:url`, incluindo o prefixo `/calculadora-entregadores/`.
2. Atualize `<title>` e `description`. Acrescente `og:title`, `og:description` e `og:image:alt` quando o material de compartilhamento estiver aprovado. Com a data confirmada, atualize `<time datetime="AAAA-MM-DD">`, o texto visível e `article:published_time`.
3. Coloque a imagem própria ou licenciada em `assets/imagens/`. Use o caminho relativo no `<img>` e a URL absoluta em `og:image`. Descreva a imagem no `alt`, informe as dimensões do arquivo e identifique imagem ilustrativa ou crédito na legenda, conforme o caso. Atualize o `srcset` se houver uma versão menor.
4. Atualize o último item da trilha de navegação. Use a categoria e os subtítulos para orientar a leitura e mantenha os parágrafos curtos. Os subtítulos podem ter `id` para navegação dentro do texto. Ao usar o índice lateral, confira se cada `href="#..."` corresponde ao `id` de um subtítulo.
5. Inclua referências quando ajudarem o leitor a conferir fatos ou recomendações. Cite a fonte junto da afirmação ou reúna as referências no fim. Quando a recomendação depender de data, local, modelo ou condições de uso, registre o recorte na matéria.
6. Inclua links de matérias relacionadas quando elas estiverem disponíveis. Adicione o card da nova publicação à lista em [`noticias/index.html`](../noticias/index.html), atualize `sitemap.xml` e confira o funcionamento dos endereços com o prefixo do repositório.

## Conferência antes da revisão

- Confira título, subtítulo, texto, imagem, crédito e fontes. Atualize a dimensão da imagem e o texto alternativo conforme o arquivo aprovado.
- Acrescente a imagem social e a data de publicação somente quando confirmadas. Verifique o endereço canônico e a identificação estável dos comentários.
- Inclua a rota no índice de notícias, no sitemap e na lista de páginas de `tests/navegacao.py`. Depois confira estrutura, links e responsividade.

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
