const decoder = new TextDecoder();
function decode(value) {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}

export async function autorizado(request, env, buscar = fetch, agora = Date.now() / 1000) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 12000 || !env.ACCESS_AUD ||
      !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_ISSUER ?? '')) return false;
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return false;
    const [header, payload, assinatura] = partes;
    const { alg, kid } = JSON.parse(decoder.decode(decode(header)));
    const dados = JSON.parse(decoder.decode(decode(payload)));
    if (alg !== 'RS256' || typeof kid !== 'string' || dados.iss !== env.ACCESS_ISSUER ||
        !Array.isArray(dados.aud) || !dados.aud.includes(env.ACCESS_AUD) ||
        !Number.isFinite(dados.exp) || dados.exp <= agora ||
        (dados.nbf !== undefined && (!Number.isFinite(dados.nbf) || dados.nbf > agora)) ||
        typeof dados.email !== 'string' || !dados.email) return false;
    const resposta = await buscar(env.ACCESS_ISSUER + '/cdn-cgi/access/certs', { signal: AbortSignal.timeout(5000) });
    if (!resposta.ok) return false;
    const jwk = (await resposta.json()).keys.find(c => c.kid === kid && c.kty === 'RSA');
    if (!jwk) return false;
    const chave = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chave, decode(assinatura),
      new TextEncoder().encode(header + '.' + payload));
  } catch {
    return false;
  }
}
