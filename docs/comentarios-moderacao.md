# Comentários nas matérias — especificação para lançamento

Decisão do proprietário em 25/11/2026: lançar o portal Lucro na Rota com comentários por reportagem, mas **sem enquetes e sem chat**. Não alterar a branch `main` até aprovação expressa após testes.

## Requisitos obrigatórios
- Comentários **separados por matéria**, abaixo do texto; não misturar discussões de páginas diferentes.
- Leitura e participação por **apelido**, sem exigir conta no GitHub, CPF, RG ou cadastro no portal.
- Campo de comentário, resposta a comentários aprovados e mensagem `Aguardando moderação` após envio. Não exibir texto não aprovado.
- Área de **moderação no navegador**: aprovar, rejeitar, excluir e revisar pendências sem terminal ou Python.
- Proteção contra spam/bots (ex.: Cloudflare Turnstile com validação no servidor e limites por requisição). Proteger contra XSS, injeção, envio repetido, carga excessiva e vazamento de credenciais. Nunca guardar tokens administrativos no código ou localStorage público.
- Não usar dados digitados nas duas calculadoras; comentários ficam em sistema separado. Coletar no máximo apelido, texto, vínculo da reportagem, data e identificadores técnicos estritamente necessários; documentar retenção e exclusão. Não publicar e-mail ou IP.
- **Privacidade desde o carregamento:** não incorporar rastreadores de comentários automaticamente em todas as páginas. Se houver serviço externo, preferir carregar ao clicar em `Ver comentários`, atualizar a política de privacidade e explicar a transferência de dados.
- Manter performance, responsividade, acessibilidade (teclado/ARIA) e estilo do portal. Sem publicidade forçada e sem botão de comentários que não funcione.
- Não usar comentários como fonte de fatos verificados; regras de convivência e possibilidade de exclusão/moderação.

## Hospedagem e custo
GitHub Pages é estático, portanto os comentários exigem um serviço adicional.

**Caminho técnico preferido:** avaliar Cloudflare Workers + D1 + Turnstile em plano gratuito, sujeito a limites, com painel de moderação acessível pelo navegador. É necessário ativar recursos na conta Cloudflare, definir domínio/URL da API e segredos do Worker. Não cadastrar, contratar ou fazer deploy externo sem autorização do proprietário. Não colocar secrets no GitHub. Projeto deve funcionar com o sistema desligado até estar configurado.

**Alternativas:** serviços prontos com comentários por URL, moderação prévia e participação de visitantes. Antes de escolher, verificar preço, limites, plano grátis, exigência de conta, publicidade, rastreamento, LGPD e possibilidade de portabilidade. A opção gratuita do Common Ninja possui restrições para comentários separados por URL, exigindo cautela. O Disqus gratuito inclui anúncios e não deve ser ativado sem análise de privacidade.

## Escopo de conteúdo e lançamento
- Colocar comentários em `noticias/como-registrar-ganhos-e-gastos.html`, `noticias/clt-ou-aplicativo.html` e `noticias/apresentacao.html`. Novas matérias precisam gerar seção própria automaticamente por identificador estável.
- Manter as duas calculadoras existentes sem comentários e sem mudanças nas fórmulas.
- Confirmar datas reais de publicação; não inventar visitas, comentários ou depoimentos.
- Revisar as matérias, links, títulos, SEO, privacidade e funcionamento de celular.
- Realizar teste fim a fim: postar, aguardar moderação, aprovar, renderizar resposta, rejeitar, excluir; verificar isolamento entre duas matérias e ausência de transferência de dados das calculadoras. Simular carga inválida, spam e scripts hostis.
- Registrar testes e pendências na documentação e entregar **prévia HTTPS navegável**.
- Publicar na `main` somente após aprovação expressa. Se serviço de comentários não estiver disponível, informar o bloqueio com clareza; **não publicar fingindo que está funcionando**.

## Critérios de aceitação
1. Visitante sem conta comenta por apelido, com anti-spam, e recebe confirmação de moderação.
2. Moderador aprova/rejeita/exclui via painel com autenticação forte.
3. Comentário aprovado aparece **só na matéria correspondente**, sem expor dados privados.
4. Comentários desativados não fazem nenhuma requisição externa nem quebram o portal.
5. Política de privacidade atualizada, testes automatizados e revisão em navegador.
6. `main` intocada até autorização.
