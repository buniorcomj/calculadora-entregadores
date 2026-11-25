import { origemComentarios } from './comentarios-config.mjs';

const secao = document.querySelector('[data-comentarios]');
if (secao && origemComentarios) {
  const url = new URL(origemComentarios);
  if (url.origin === origemComentarios && url.protocol === 'https:' && url.origin !== location.origin) {
    const botao = secao.querySelector('button');
    const aviso = secao.querySelector('p');
    aviso.hidden = false;
    botao.addEventListener('click', () => {
      const quadro = document.createElement('iframe');
      quadro.title = 'Comentários desta matéria';
      quadro.className = 'comentarios-quadro';
      quadro.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';
      quadro.referrerPolicy = 'no-referrer';
      quadro.src = new URL('/comentarios/' + secao.dataset.comentarios, url).href;
      secao.append(quadro);
      botao.hidden = true;
      quadro.tabIndex = 0;
      quadro.focus();
    }, { once: true });
    botao.hidden = false;
    secao.hidden = false;
  }
}
