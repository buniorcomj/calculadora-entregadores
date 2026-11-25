import { autorizado } from './access.mjs';

const DIA = 86400;
const MAX_BYTES = 8192;
const textoUtf8 = new TextEncoder();
const escapar = valor => String(valor).replace(/[&<>"']/g, letra => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[letra]);
const idValido = id => /^[1-9][0-9]{0,14}$/.test(id ?? '');
const artigoValido = artigo => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(artigo ?? '') && artigo.length <= 80;
const data = valor => new Date(valor * 1000).toISOString().slice(0, 10);

function origemHttps(valor) {
  try {
    const url = new URL(valor);
    return url.protocol === 'https:' && url.origin === valor;
  } catch {
    return false;
  }
}

function pagina(titulo, conteudo, status, env, moderacao = false) {
  const turnstile = 'https://challenges.cloudflare.com';
  const ancestry = moderacao || !origemHttps(env.PORTAL_ORIGEM) ? "'none'" : env.PORTAL_ORIGEM;
  return new Response(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapar(titulo)}</title><style>
    body{font:1rem/1.5 system-ui,sans-serif;color:#142d24;margin:0 auto;padding:1rem;max-width:48rem}
    label,input,textarea{display:block;box-sizing:border-box;width:100%}
    input,textarea,button{font:inherit;padding:.45rem}button{background:#174c36;color:white;border:0;border-radius:.25rem;cursor:pointer}
    article{border-bottom:1px solid #cad7ce;padding:.5rem 0;overflow-wrap:anywhere}
    article p{white-space:pre-wrap}form{margin:1rem 0}a{color:#174c36}.acoes{display:flex;gap:.55rem;flex-wrap:wrap}
    .resposta{margin-left:1.25rem} :focus-visible{outline:3px solid #875002;outline-offset:2px}</style></head>
    <body><main><h1>${escapar(titulo)}</h1>${conteudo}</main></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Referrer-Policy': 'same-origin', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': `default-src 'none'; style-src 'unsafe-inline'; script-src ${moderacao ? "'none'" : turnstile}; frame-src ${moderacao ? "'none'" : turnstile}; frame-ancestors ${ancestry}; base-uri 'none'; form-action 'self'` },
  });
}

async function lerFormulario(request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/x-www-form-urlencoded') return null;
  if (!request.body || Number(request.headers.get('content-length')) > MAX_BYTES) return null;
  const leitor = request.body.getReader();
  const buffer = new Uint8Array(MAX_BYTES);
  let tamanho = 0;
  while (true) {
    const { value, done } = await leitor.read();
    if (done) break;
    if (tamanho + value.length > MAX_BYTES) {
      await leitor.cancel();
      return null;
    }
    buffer.set(value, tamanho);
    tamanho += value.length;
  }
  return new URLSearchParams(new TextDecoder().decode(buffer.subarray(0, tamanho)));
}

async function hmac(segredo, valor) {
  const chave = await crypto.subtle.importKey('raw', textoUtf8.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const dados = await crypto.subtle.sign('HMAC', chave, textoUtf8.encode(valor));
  return Array.from(new Uint8Array(dados), n => n.toString(16).padStart(2, '0')).join('');
}

async function limite(env, ip, agora) {
  const janela = Math.floor(agora / DIA);
  const chave = await hmac(env.ANTISPAM_SECRET, 'ip:' + janela + ':' + ip);
  const resultado = await env.DB.prepare(`INSERT INTO limites VALUES (?, ?, 1)
    ON CONFLICT(chave, janela) DO UPDATE SET total = total + 1 WHERE total < 12
    RETURNING total`).bind(chave, janela).first();
  return Boolean(resultado);
}

async function desafio(token, env, buscar) {
  if (!token || token.length > 2048) return false;
  const resposta = await buscar('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
    signal: AbortSignal.timeout(5000),
  });
  if (!resposta.ok) return false;
  const dados = await resposta.json();
  return dados.success === true && dados.action === 'comentar' && dados.hostname === new URL(env.API_ORIGEM).hostname;
}

const rota = artigo => '/comentarios/' + artigo;
const redirecionar = caminho => new Response(null, { status: 303, headers: { Location: caminho, 'Cache-Control': 'no-store' } });

async function listar(env, artigo, url) {
  const anterior = idValido(url.searchParams.get('antes')) ? Number(url.searchParams.get('antes')) : Number.MAX_SAFE_INTEGER;
  const { results } = await env.DB.prepare(`SELECT c.id,c.apelido,c.texto,c.criado,c.pai,p.apelido AS responde
    FROM comentarios c LEFT JOIN comentarios p ON p.id=c.pai
    WHERE c.artigo=? AND c.estado='aprovado' AND c.id<? AND (c.pai IS NULL OR p.estado='aprovado')
    ORDER BY c.id DESC LIMIT 31`).bind(artigo, anterior).all();
  const resposta = url.searchParams.get('responder');
  const pai = idValido(resposta) ? await env.DB.prepare(
    "SELECT id, apelido FROM comentarios WHERE id=? AND artigo=? AND estado='aprovado' AND pai IS NULL"
  ).bind(Number(resposta), artigo).first() : null;
  const itens = results.slice(0, 30).map(c => `<article${c.pai ? ' class="resposta"' : ''}><h2>${escapar(c.apelido)}</h2>
    <time datetime="${data(c.criado)}">${data(c.criado).split('-').reverse().join('/')}</time>${c.pai ? ` · em resposta a ${escapar(c.responde)}` : ''}
    <p>${escapar(c.texto)}</p>${c.pai ? '' : `<a href="${rota(artigo)}?responder=${c.id}#formulario">Responder</a>`}</article>`).join('');
  return pagina('Comentários', `
    ${url.searchParams.get('enviado') === '1' ? '<p role="status">Aguardando moderação</p>' : ''}
    ${itens || '<p>Não há comentários aprovados nesta página.</p>'}
    ${url.searchParams.has('antes') ? `<p><a href="${rota(artigo)}">Comentários recentes</a></p>` : ''}
    ${results.length > 30 ? `<p><a href="${rota(artigo)}?antes=${results[29].id}">Comentários anteriores</a></p>` : ''}
    <form id="formulario" method="post" action="${rota(artigo)}">
      <h2>${pai ? 'Responder a ' + escapar(pai.apelido) : 'Deixe seu comentário'}</h2>
      ${pai ? `<input type="hidden" name="pai" value="${pai.id}"><p><a href="${rota(artigo)}#formulario">Cancelar resposta</a></p>` : ''}
      <p>Respeite os demais leitores e mantenha o assunto da matéria. Evite contatos, documentos e outros dados pessoais. A equipe revisa antes de publicar. O Turnstile verifica envios automatizados. <a target="_blank" rel="noopener noreferrer" href="${escapar(env.PORTAL_PRIVACIDADE)}">Política de privacidade do portal</a>.</p>
      <label for="apelido">Apelido</label><input id="apelido" name="apelido" maxlength="32" required autocomplete="off">
      <label for="texto">Comentário</label><textarea id="texto" name="texto" rows="4" minlength="5" maxlength="1000" required></textarea>
      <div class="cf-turnstile" data-sitekey="${escapar(env.TURNSTILE_SITE_KEY)}" data-action="comentar" data-language="pt-br"></div>
      <button>Enviar para moderação</button>
    </form>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>`, 200, env);
}

async function enviar(request, env, artigo, buscar, agora) {
  const falha = (mensagem, status) => pagina('Comentário não enviado', `<p>${mensagem}</p><a href="${rota(artigo)}#formulario">Voltar ao formulário</a>`, status, env);
  const form = await lerFormulario(request);
  const apelido = form?.get('apelido')?.trim().normalize('NFC');
  const texto = form?.get('texto')?.trim().normalize('NFC');
  const pai = form?.get('pai');
  if (!apelido || apelido.length > 32 || !texto || texto.length < 5 || texto.length > 1000 ||
      (pai !== null && !idValido(pai))) return falha('Confira o apelido e o texto do comentário.', 400);
  if (/[\u0000-\u001f\u007f]/.test(apelido) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(texto)) {
    return falha('O texto contém caracteres incompatíveis.', 400);
  }
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return falha('Verificação indisponível. Tente novamente mais tarde.', 503);
  if (!await limite(env, ip, agora)) return falha('Limite de envios atingido. Tente novamente amanhã.', 429);
  if (!await desafio(form.get('cf-turnstile-response'), env, buscar)) return falha('Refaça a verificação antispam.', 403);
  const assinatura = await hmac(env.ANTISPAM_SECRET, JSON.stringify([artigo, pai, apelido.toLowerCase(), texto]));
  const resultado = await env.DB.prepare(`INSERT INTO comentarios(artigo,pai,apelido,texto,criado,assinatura)
    SELECT ?,?,?,?,?,? WHERE ? IS NULL OR EXISTS(
      SELECT 1 FROM comentarios WHERE id=? AND artigo=? AND estado='aprovado' AND pai IS NULL)
    ON CONFLICT(assinatura) DO NOTHING`).bind(artigo, pai, apelido, texto, agora, assinatura, pai, pai, artigo).run();
  if (!resultado.meta.changes && pai && !await env.DB.prepare(
    "SELECT id FROM comentarios WHERE id=? AND artigo=? AND estado='aprovado' AND pai IS NULL"
  ).bind(pai, artigo).first()) return falha('Esse comentário não aceita respostas.', 400);
  return redirecionar(rota(artigo) + '?enviado=1');
}

async function painel(request, env, url, buscar, agora) {
  if (!await autorizado(request, env, buscar, agora)) return pagina('Acesso restrito', '<p>Entre pelo Cloudflare Access com a conta autorizada.</p>', 403, env, true);
  if (request.method === 'POST') {
    const form = await lerFormulario(request);
    const id = form?.get('id');
    const acao = form?.get('acao');
    if (!idValido(id) || !['aprovar', 'rejeitar', 'excluir'].includes(acao)) {
      return pagina('Ação inválida', '<p>Volte ao painel e confira a seleção.</p>', 400, env, true);
    }
    let resultado;
    if (acao === 'excluir') {
      resultado = await env.DB.prepare('DELETE FROM comentarios WHERE id=?').bind(id).run();
    } else {
      resultado = await env.DB.prepare(`UPDATE comentarios SET estado=?,revisado=? WHERE id=? AND
        (?='rejeitado' OR pai IS NULL OR EXISTS(SELECT 1 FROM comentarios p WHERE p.id=comentarios.pai AND p.estado='aprovado'))`)
        .bind(acao === 'aprovar' ? 'aprovado' : 'rejeitado', agora, id, acao === 'aprovar' ? 'aprovado' : 'rejeitado').run();
    }
    if (!resultado.meta.changes) {
      return pagina('Ação não aplicada', '<p>O comentário já foi excluído ou a resposta ainda não pode ser aprovada.</p><a href="/moderacao">Voltar ao painel</a>', 409, env, true);
    }
    return redirecionar('/moderacao?acao=' + acao);
  }
  const filtro = ['pendente', 'aprovado', 'rejeitado'].includes(url.searchParams.get('estado')) ? url.searchParams.get('estado') : 'pendente';
  const antes = idValido(url.searchParams.get('antes')) ? Number(url.searchParams.get('antes')) : Number.MAX_SAFE_INTEGER;
  const { results } = await env.DB.prepare('SELECT id,artigo,pai,apelido,texto,criado FROM comentarios WHERE estado=? AND id<? ORDER BY id DESC LIMIT 31').bind(filtro, antes).all();
  const confirmacao = {
    aprovar: 'Comentário aprovado.',
    rejeitar: 'Comentário rejeitado.',
    excluir: 'Comentário excluído.',
  };
  const mensagem = Object.hasOwn(confirmacao, url.searchParams.get('acao')) ? confirmacao[url.searchParams.get('acao')] : '';
  return pagina('Moderação de comentários', `${mensagem ? `<p role="status">${mensagem}</p>` : ''}<nav aria-label="Filtrar comentários"><a href="/moderacao">Pendentes</a> ·
    <a href="/moderacao?estado=aprovado">Aprovados</a> · <a href="/moderacao?estado=rejeitado">Rejeitados</a></nav>
    <h2>Estado: ${filtro}</h2>
    ${results.slice(0,30).map(c => `<article><h3>${escapar(c.apelido)}</h3><p>${escapar(c.artigo)} · ${data(c.criado)}${c.pai ? ' · resposta a #' + c.pai : ''}</p><p>${escapar(c.texto)}</p>
    <form method="post" action="/moderacao" class="acoes"><input type="hidden" name="id" value="${c.id}">
    <button name="acao" value="aprovar">Aprovar</button><button name="acao" value="rejeitar">Rejeitar</button>
    <button name="acao" value="excluir">Excluir comentário e respostas</button></form></article>`).join('') || '<p>Nenhum comentário neste filtro.</p>'}
    ${results.length > 30 ? `<p><a href="/moderacao?estado=${filtro}&amp;antes=${results[29].id}">Página anterior</a></p>` : ''}`, 200, env, true);
}

export async function atender(request, env, buscar = fetch, agora = Math.floor(Date.now() / 1000)) {
  const url = new URL(request.url);
  const artigo = url.pathname.split('/')[2];
  const moderacao = url.pathname === '/moderacao';
  const publico = artigoValido(artigo) && url.pathname === rota(artigo);
  const aviso = (titulo, status) => pagina(titulo, '', status, env, moderacao);
  if ((!publico && !moderacao) || url.origin !== env.API_ORIGEM) return aviso('Página não encontrada', 404);
  if (!['GET', 'POST'].includes(request.method)) return aviso('Método indisponível', 405);
  if (request.method === 'POST' && request.headers.get('Origin') !== env.API_ORIGEM) return aviso('Origem não autorizada', 403);
  if (!env.DB || !origemHttps(env.PORTAL_ORIGEM) || !env.TURNSTILE_SECRET || !env.TURNSTILE_SITE_KEY ||
      !env.PORTAL_PRIVACIDADE?.startsWith(env.PORTAL_ORIGEM + '/') ||
      (env.ANTISPAM_SECRET?.length ?? 0) < 32) return aviso('Comentários temporariamente indisponíveis', 503);
  try {
    if (moderacao) return await painel(request, env, url, buscar, agora);
    return request.method === 'POST' ? await enviar(request, env, artigo, buscar, agora) : await listar(env, artigo, url);
  } catch {
    return aviso('Comentários temporariamente indisponíveis', 503);
  }
}

export async function limpar(env, agora) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM comentarios WHERE estado='pendente' AND criado<?").bind(agora - 90 * DIA),
    env.DB.prepare("DELETE FROM comentarios WHERE estado='rejeitado' AND revisado<?").bind(agora - 30 * DIA),
    env.DB.prepare('DELETE FROM limites WHERE janela<?').bind(Math.floor(agora / DIA)),
  ]);
}

export default {
  fetch: (request, env) => atender(request, env),
  scheduled: (evento, env, ctx) => ctx.waitUntil(limpar(env, Math.floor(evento.scheduledTime / 1000))),
};
