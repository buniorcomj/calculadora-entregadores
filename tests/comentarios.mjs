import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { atender, limpar } from '../comentarios/worker.mjs';

const origem = 'https://comentarios.example.test';
const agora = 1795600000;
const caminho = '/comentarios/materia-um';
const chaves = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', chaves.publicKey), kid: 'teste' };

function banco() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../comentarios/migrations/0001_comentarios.sql', import.meta.url), 'utf8'));
  const preparar = query => {
    const stmt = sql.prepare(query);
    return { bind: (...args) => ({
      first: async () => stmt.get(...args),
      all: async () => ({ results: stmt.all(...args) }),
      run: async () => ({ meta: stmt.run(...args) }),
    }) };
  };
  return { sql, prepare: preparar, batch: comandos => Promise.all(comandos.map(c => c.run())) };
}

async function token(env, dados = {}) {
  const base64 = valor => Buffer.from(JSON.stringify(valor)).toString('base64url');
  const partes = base64({ alg: 'RS256', kid: 'teste' }) + '.' + base64({
    iss: env.ACCESS_ISSUER, aud: [env.ACCESS_AUD], exp: agora + 600, email: 'teste@example.test', ...dados,
  });
  const assinatura = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chaves.privateKey, new TextEncoder().encode(partes));
  return partes + '.' + Buffer.from(assinatura).toString('base64url');
}

function cenario() {
  const DB = banco();
  const env = { DB, API_ORIGEM: origem, PORTAL_ORIGEM: 'https://portal.example.test',
    PORTAL_PRIVACIDADE: 'https://portal.example.test/privacidade/', TURNSTILE_SITE_KEY: 'sitekey-ficticia',
    TURNSTILE_SECRET: 'turnstile-ficticio', ANTISPAM_SECRET: 'segredo-de-teste-com-mais-de-32-byte',
    ACCESS_ISSUER: 'https://equipe-teste.cloudflareaccess.com', ACCESS_AUD: 'audiencia-teste' };
  const buscar = async (url, opcoes) => url.endsWith('/certs') ? Response.json({ keys: [jwk] })
    : Response.json({ success: opcoes.body.get('response') !== 'bot',
      action: 'comentar', hostname: opcoes.body.get('response') === 'outro-host' ? 'outro.test' : new URL(origem).hostname });
  const chamar = (rota, dados, jwt, opcoes = {}) => atender(new Request(origem + rota, {
    method: dados ? 'POST' : 'GET', body: dados ? new URLSearchParams(dados) : undefined,
    headers: { Origin: origem, 'CF-Connecting-IP': '192.0.2.1', ...(jwt ? { 'Cf-Access-Jwt-Assertion': jwt } : {}), ...opcoes },
  }), env, buscar, agora);
  const enviar = (campos = {}, rota = caminho) => chamar(rota, {
    apelido: 'Roda 1', texto: 'Mensagem de teste', 'cf-turnstile-response': 'valido', ...campos,
  });
  return { DB, env, chamar, enviar };
}

test('envia, aguarda aprovação, responde, aprova, rejeita e exclui por matéria', async () => {
  const { DB, env, chamar, enviar } = cenario();
  const jwt = await token(env);
  const moderar = (id, acao) => chamar('/moderacao', { id, acao }, jwt);
  const envio = await enviar();
  assert.equal(envio.status, 303);
  const pendente = await (await chamar(envio.headers.get('Location'))).text();
  assert.match(pendente, /Aguardando moderação/);
  assert.doesNotMatch(pendente, /Mensagem de teste/);
  assert.match(await (await chamar('/moderacao', null, jwt)).text(), /Mensagem de teste/);
  assert.equal((await moderar(1, 'aprovar')).status, 303);
  assert.match(await (await chamar(caminho)).text(), /Mensagem de teste/);
  assert.doesNotMatch(await (await chamar('/comentarios/materia-dois')).text(), /Mensagem de teste/);
  assert.equal((await enviar({ pai: 1, texto: 'Resposta de outra matéria' }, '/comentarios/materia-dois')).status, 400);
  assert.equal((await enviar({ pai: 1, texto: 'Resposta em revisão' })).status, 303);
  assert.doesNotMatch(await (await chamar(caminho)).text(), /Resposta em revisão/);
  await moderar(2, 'aprovar');
  assert.match(await (await chamar(caminho)).text(), /Resposta em revisão/);
  await moderar(1, 'rejeitar');
  assert.doesNotMatch(await (await chamar(caminho)).text(), /Mensagem de teste|Resposta em revisão/);
  await moderar(1, 'excluir');
  assert.equal(DB.sql.prepare('SELECT COUNT(*) AS n FROM comentarios').get().n, 0);
});

test('bloqueia painel anônimo, sessão inválida e POST de outra origem', async () => {
  const { env, chamar } = cenario();
  const jwt = await token(env);
  for (const credencial of [undefined, jwt + 'e', await token(env, { aud: ['outra'] }), await token(env, { exp: agora })]) {
    assert.equal((await chamar('/moderacao', null, credencial)).status, 403);
  }
  assert.equal((await chamar('/moderacao', { id: 1, acao: 'aprovar' }, jwt, { Origin: 'https://fora.example.test' })).status, 403);
  assert.match((await chamar('/moderacao', null, jwt)).headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('valida carga, desafio antispam e limite, escapa texto e não duplica envios', async () => {
  const { DB, env, chamar, enviar } = cenario();
  assert.equal((await enviar({ texto: 'a'.repeat(1001) })).status, 400);
  assert.equal((await enviar({ texto: 'a'.repeat(9000) })).status, 400);
  assert.equal((await enviar({ 'cf-turnstile-response': 'bot' })).status, 403);
  assert.equal((await enviar({ 'cf-turnstile-response': 'outro-host' })).status, 403);
  const hostil = { apelido: '<img src=x>', texto: "<script>alert('x')</script> ' OR 1=1 --" };
  assert.equal((await enviar(hostil)).status, 303);
  assert.equal((await enviar(hostil)).status, 303);
  assert.equal(DB.sql.prepare('SELECT COUNT(*) AS n FROM comentarios').get().n, 1);
  await chamar('/moderacao', { id: 1, acao: 'aprovar' }, await token(env));
  const publico = await (await chamar(caminho)).text();
  assert.match(publico, /&lt;script&gt;alert/);
  assert.doesNotMatch(publico, /<img src=x>|<script>alert|192\.0\.2\.1|segredo-de-teste/);
  for (let i = 0; i < 8; i++) assert.equal((await enviar()).status, 303);
  assert.equal((await enviar()).status, 429);
  await limpar(env, agora + 91 * 86400);
  assert.equal(DB.sql.prepare('SELECT COUNT(*) AS n FROM limites').get().n, 0);
  assert.equal(DB.sql.prepare('SELECT COUNT(*) AS n FROM comentarios').get().n, 1);
});

test('portal desativado e calculadoras isoladas dos comentários', async () => {
  const ler = caminho => readFileSync(new URL('../' + caminho, import.meta.url), 'utf8');
  const { origemComentarios } = await import('../assets/js/comentarios-config.mjs');
  assert.equal(origemComentarios, '');
  for (const slug of ['apresentacao', 'clt-ou-aplicativo', 'como-registrar-ganhos-e-gastos']) {
    const pagina = ler('noticias/' + slug + '.html');
    assert.match(pagina, new RegExp('data-comentarios="' + slug + '"[^>]+hidden>'));
    assert.doesNotMatch(pagina, /iframe|challenges\.cloudflare\.com/);
  }
  for (const pagina of ['calculadora/index.html', 'aplicativo-x-clt/index.html']) {
    assert.doesNotMatch(ler(pagina), /comentarios\.mjs|challenges\.cloudflare\.com/);
    assert.match(ler(pagina), /connect-src 'none'/);
  }
});
