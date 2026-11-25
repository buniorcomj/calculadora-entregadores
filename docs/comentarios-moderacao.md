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
- Colocar comentários em `noticias/apresentacao.html`, `noticias/tutorial-calculadora-financeira.html` e `noticias/tutorial-aplicativo-x-clt.html`. Novas matérias precisam gerar seção própria automaticamente por identificador estável.
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

## Implementação — 25/11/2026

O código do serviço está em `comentarios/`. O portal só abre o serviço após clicar em **Ver comentários**. Com a origem vazia, o bloco fica oculto e as reportagens carregam apenas recursos do próprio portal. O Worker recebe o envio no seu domínio, verifica o Turnstile e grava em D1. Uma publicação precisa ser aprovada antes de aparecer. Respostas são de um nível e precisam pertencer à mesma matéria e ter um comentário principal aprovado. Excluir o principal também exclui suas respostas. Rejeitar o principal oculta suas respostas.

A moderação funciona no navegador em `/moderacao`. O Worker verifica a assinatura, validade, emissor e audiência do token do Cloudflare Access. Os formulários exigem a origem do próprio serviço. O serviço escapa as mensagens ao renderizar, limita tamanho e quantidade de envios, usa parâmetros no SQL e suprime duplicatas idênticas. Não há armazenamento de IP bruto. Há limite de 12 tentativas válidas de formulário por dia UTC por endereço de saída, inclusive compartilhado. Um HMAC diário com segredo do servidor permite a contagem. O agendamento diário remove identificadores de dias anteriores, pendências com mais de 90 dias e rejeições com mais de 30 dias. Os aprovados ficam até a moderação excluí-los. As duas calculadoras mantêm sua política de conexão e ficam fora desse fluxo.

### Configuração externa pendente

Depois da autorização do proprietário, a configuração pode ser feita com acesso delegado à Cloudflare. O proprietário não precisa instalar ou executar comandos. Se já houver uma conta, delegue acesso limitado aos recursos de teste, sem compartilhar senha nem segredos pelo chat.

1. Identificar a conta Cloudflare e um domínio que possa receber um subdomínio só para comentários. Usar um ambiente de homologação em HTTPS, separado do portal de produção. Verificar que Workers, D1, Turnstile e Access estão dentro dos limites do plano gratuito antes de ativar.
2. Criar uma base D1 de homologação, aplicar `comentarios/migrations/0001_comentarios.sql` e vincular ao Worker como `DB`. O exemplo `comentarios/wrangler.toml.example` documenta o vínculo e a limpeza diária. Associar o subdomínio ao Worker e manter desabilitados os endereços alternativos de execução.
3. Criar um widget Turnstile do tipo gerenciado para o hostname do Worker. A chave pública vai em `TURNSTILE_SITE_KEY`. Armazenar a chave privada em `TURNSTILE_SECRET` e um segredo aleatório de pelo menos 32 bytes em `ANTISPAM_SECRET`, ambos como segredos do Worker.
4. No Cloudflare Zero Trust, criar uma aplicação Access apenas para o caminho exato `/moderacao` no hostname do Worker. Permitir apenas as contas autorizadas, exigir autenticação multifator no provedor de identidade e copiar a URL do time e o Audience Tag para `ACCESS_ISSUER` e `ACCESS_AUD`. A rota pública `/comentarios/*` permanece acessível sem conta. Para operações administrativas, acessar `/moderacao` pela barra de endereços, não dentro de uma matéria.
5. Para homologar, definir `API_ORIGEM` como a origem HTTPS do Worker, `PORTAL_ORIGEM` como a origem HTTPS da prévia e `PORTAL_PRIVACIDADE` como a URL da política de privacidade dessa prévia. Em uma cópia da prévia, preencher a origem em `assets/js/comentarios-config.mjs` e acrescentar `frame-src https://HOST-DO-WORKER` à política CSP de cada reportagem. A política das calculadoras permanece intacta.
6. Fazer o teste em HTTPS com dados fictícios: clicar para carregar, enviar sem conta no serviço de comentários, confirmar que a mensagem está oculta, aprovar com uma conta autorizada, responder, rejeitar, excluir e repetir em outra matéria para verificar isolamento. Em sessão sem login, conferir que o painel recusa acesso. Conferir dispositivos móveis e navegação por teclado. A prévia desativada não valida Turnstile, Access ou D1 reais.

### Verificações locais

O teste automatizado em `tests/comentarios.mjs` usa SQLite em memória com a migração real, chaves de assinatura geradas no teste e respostas simuladas para Turnstile e para a lista de chaves do Access. Exercita o fluxo de moderação, isolamento, acesso indevido, carga inválida, spam, deduplicação, escaping, limpeza e isolamento das calculadoras. O teste fim a fim com Cloudflare real fica pendente de autorização e configuração. A tarefa do GitHub permanece aberta.
