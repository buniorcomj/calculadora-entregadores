from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import urlopen
import argparse
import re
import xml.etree.ElementTree as ET


RAIZ = Path(__file__).resolve().parent.parent
BASE = "https://buniorcomj.github.io/calculadora-entregadores/"
ORIGEM = urlsplit(BASE).netloc
PREFIXO = urlsplit(BASE).path
PAGINAS = {
    "index.html": "",
    "aplicativo-x-clt/index.html": "aplicativo-x-clt/",
    "noticias/tutorial-calculadora-financeira.html": "noticias/tutorial-calculadora-financeira.html",
    "noticias/tutorial-aplicativo-x-clt.html": "noticias/tutorial-aplicativo-x-clt.html",
    "calculadora/index.html": "calculadora/",
    "noticias/index.html": "noticias/",
    "noticias/apresentacao.html": "noticias/apresentacao.html",
    "sobre/index.html": "sobre/",
    "privacidade/index.html": "privacidade/",
    "criterios-editoriais/index.html": "criterios-editoriais/",
}


class Documento(HTMLParser):
    VAZIOS = set("area base br col embed hr img input link meta param source track wbr".split())
    RAIZ = ["html", "head", "body"]
    def __init__(self, arquivo):
        super().__init__(convert_charrefs=True)
        self.abertos = []
        self.raiz = []
        self.erros_html = []
        self.ids = set()
        self.duplicados = set()
        self.links = []
        self.canonicos = []
        self.descricao = ""
        self.id_referidos = set()
        self.estrutura = []
        self.imagens_sem_alt = []
        self.lang = ""
        self.feed(arquivo.read_text(encoding="utf-8"))
        self.close()
        if self.abertos:
            self.erros_html.append(f"tags sem fechamento: {', '.join(self.abertos)}")
        if self.raiz != self.RAIZ:
            self.erros_html.append("esperados html, head e body únicos e na ordem correta")

    def handle_endtag(self, tag):
        if not self.abertos or self.abertos[-1] != tag:
            linha, _ = self.getpos()
            self.erros_html.append(f"linha {linha}: fechamento inesperado </{tag}>")
            return
        self.abertos.pop()

    def handle_starttag(self, tag, atributos):
        if tag in self.RAIZ:
            pai = [] if tag == "html" else ["html"]
            if self.abertos != pai:
                self.erros_html.append(f"<{tag}> fora da posição esperada")
            self.raiz.append(tag)
        if tag not in self.VAZIOS:
            self.abertos.append(tag)
        attr = dict(atributos)
        if tag == "html":
            self.lang = attr.get("lang", "")
        if tag in ("main", "h1"):
            self.estrutura.append(tag)
        if tag == "img" and "alt" not in attr:
            self.imagens_sem_alt.append(attr.get("src", "sem src"))
        for atributo in ("aria-controls", "aria-describedby", "aria-labelledby"):
            self.id_referidos.update(attr.get(atributo, "").split())
        if tag == "label" and attr.get("for"):
            self.id_referidos.add(attr["for"])
        identificador = attr.get("id")
        if identificador:
            if identificador in self.ids:
                self.duplicados.add(identificador)
            self.ids.add(identificador)
        if tag == "meta" and attr.get("name") == "description":
            self.descricao = attr.get("content", "").strip()
        if tag == "link" and attr.get("rel") == "canonical":
            self.canonicos.append(attr.get("href"))
        elif attr.get("href"):
            rel = attr.get("rel", "").split()
            carrega = tag == "link" and any(
                nome in rel for nome in ("stylesheet", "icon", "preload", "prefetch", "preconnect")
            )
            self.links.append((attr["href"], carrega))
        if attr.get("src"):
            self.links.append((attr["src"], True))
        for candidato in attr.get("srcset", "").split(","):
            if candidato.strip():
                self.links.append((candidato.split()[0], True))


def verificar(preview):
    erros = []
    documentos = {}
    conferidos = {}
    referencias = 0
    for pagina in PAGINAS:
        arquivo = RAIZ / pagina
        if not arquivo.is_file():
            erros.append(f"Página ausente: {pagina}")
            continue
        documento = Documento(arquivo)
        documentos[arquivo] = documento
        erros.extend(f"{pagina}: {erro}" for erro in documento.erros_html)
        if documento.duplicados:
            erros.append(f"{pagina}: IDs duplicados: {', '.join(sorted(documento.duplicados))}")
        if documento.canonicos != [urljoin(BASE, PAGINAS[pagina])]:
            erros.append(f"{pagina}: canonical incorreto: {documento.canonicos}")
        if not documento.descricao:
            erros.append(f"{pagina}: descrição ausente")
        if documento.lang.lower() != "pt-br" or documento.estrutura != ["main", "h1"]:
            erros.append(f"{pagina}: esperado lang=pt-BR e um h1 dentro do conteúdo principal")
        if documento.imagens_sem_alt:
            erros.append(f"{pagina}: imagens sem atributo alt: {documento.imagens_sem_alt}")
        ids_ausentes = documento.id_referidos - documento.ids
        if ids_ausentes:
            erros.append(f"{pagina}: referências de acessibilidade sem ID: {', '.join(sorted(ids_ausentes))}")

    def conferir(referencia, origem, recurso=False):
        nonlocal referencias
        partes = urlsplit(urljoin(origem, referencia))
        if partes.netloc != ORIGEM or partes.scheme not in ("http", "https"):
            if recurso:
                erros.append(f"{origem}: carregamento externo: {referencia}")
            return
        if partes.scheme != "https":
            erros.append(f"{origem}: caminho fora de HTTPS: {referencia}")
        if not partes.path.startswith(PREFIXO):
            erros.append(f"{origem}: caminho fora de {PREFIXO}: {referencia}")
            return
        referencias += 1
        caminho = unquote(partes.path[len(PREFIXO):])
        arquivo = (RAIZ / caminho).resolve()
        if arquivo.is_dir():
            arquivo /= "index.html"
        if not arquivo.is_relative_to(RAIZ) or not arquivo.is_file():
            erros.append(f"{origem}: arquivo ausente: {referencia}")
            return
        if partes.fragment and arquivo.suffix == ".html":
            documento = documentos.get(arquivo)
            if documento is None:
                documento = Documento(arquivo)
                documentos[arquivo] = documento
            if unquote(partes.fragment) not in documento.ids:
                erros.append(f"{origem}: âncora ausente: {referencia}")
        conferidos[caminho] = arquivo

    for pagina, rota in PAGINAS.items():
        origem = urljoin(BASE, rota)
        documento = documentos.get(RAIZ / pagina)
        if documento:
            conferir(origem, origem)
            for link, recurso in documento.links:
                conferir(link, origem, recurso)

    for arquivo in sorted((RAIZ / "assets" / "css").glob("*.css")):
        rota = arquivo.relative_to(RAIZ).as_posix()
        origem = urljoin(BASE, rota)
        for link in re.findall(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", arquivo.read_text(encoding="utf-8")):
            conferir(link.strip(), origem, recurso=True)

    try:
        sitemap = ET.parse(RAIZ / "sitemap.xml")
        destinos = [url.text for url in sitemap.findall("{*}url/{*}loc")]
        if sorted(destinos) != sorted(urljoin(BASE, rota) for rota in PAGINAS.values()):
            erros.append(f"sitemap.xml: rotas incompatíveis com as páginas: {destinos}")
        for destino in destinos:
            conferir(destino, urljoin(BASE, "sitemap.xml"))
        conferir("sitemap.xml", BASE)
    except (OSError, TypeError, ET.ParseError) as erro:
        erros.append(f"sitemap.xml: {erro}")

    if preview:
        raiz_preview = preview.rstrip("/") + "/"
        for caminho, arquivo in conferidos.items():
            url = urljoin(raiz_preview, caminho)
            try:
                with urlopen(url, timeout=10) as resposta:
                    if resposta.status != 200 or resposta.read() != arquivo.read_bytes():
                        erros.append(f"{url}: conteúdo diferente do arquivo esperado")
            except OSError as erro:
                erros.append(f"{url}: {erro}")

    for erro in erros:
        print(erro)
    if erros:
        raise SystemExit(1)

    print(f"{len(PAGINAS)} páginas e {referencias} referências no prefixo {PREFIXO}")
    print(f"{len(conferidos)} destinos únicos conferidos, sem arquivos ou âncoras ausentes")
    if preview:
        print(f"HTTP 200 e conteúdo correto para todos os destinos em {raiz_preview}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Conferir URLs, arquivos e metadados do portal.")
    parser.add_argument("--preview", help="URL de prévia do portal já em execução.")
    args = parser.parse_args()
    verificar(args.preview)
