PRAGMA foreign_keys = ON;
CREATE TABLE comentarios (
  id INTEGER PRIMARY KEY,
  artigo TEXT NOT NULL,
  pai INTEGER REFERENCES comentarios(id) ON DELETE CASCADE,
  apelido TEXT NOT NULL,
  texto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','aprovado','rejeitado')),
  criado INTEGER NOT NULL,
  revisado INTEGER,
  assinatura TEXT NOT NULL UNIQUE
);
CREATE INDEX por_artigo ON comentarios(artigo, estado, criado, id);
CREATE INDEX fila ON comentarios(estado, criado, id);
CREATE TABLE limites (
  chave TEXT NOT NULL,
  janela INTEGER NOT NULL,
  total INTEGER NOT NULL,
  PRIMARY KEY(chave, janela)
);
