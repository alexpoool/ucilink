-- ============================================================================
-- LinkedIn Universitario — Esquema completo (PostgreSQL)
-- ============================================================================

-- ============ EXTENSIONES ============
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ ENUMS ============
CREATE TYPE rol_usuario AS ENUM ('aspirante','empresa','admin');
CREATE TYPE autor_tipo AS ENUM ('aspirante','empresa');
CREATE TYPE tipo_oferta AS ENUM ('normal','dash','feat');
CREATE TYPE estado_oferta AS ENUM ('borrador','publicada','cerrada','cancelada');
CREATE TYPE estado_evaluacion AS ENUM ('postulado','en_revision','preseleccionado','rechazado','fichado','retirado');
CREATE TYPE estado_grupo AS ENUM ('formando','completo','postulado','cerrado');
CREATE TYPE estado_miembro AS ENUM ('invitado','aceptado','rechazado','salido');
CREATE TYPE reaccion AS ENUM ('like','dislike');

-- ============ USUARIO ============
CREATE TABLE usuario (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  rol           rol_usuario NOT NULL,
  activo        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============ PERFILES ============
CREATE TABLE aspirante (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id     UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nombre         VARCHAR NOT NULL,
  apellido       VARCHAR NOT NULL,
  telefono       VARCHAR,
  carrera        VARCHAR,
  semestre       SMALLINT,
  bio            TEXT,
  habilidades    TEXT[],
  linkedin_url   VARCHAR,
  github_url     VARCHAR,
  portafolio_url VARCHAR,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE empresa (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nombre       VARCHAR NOT NULL,
  razon_social VARCHAR,
  ruc          VARCHAR UNIQUE,
  sector       VARCHAR,
  descripcion  TEXT,
  sitio_web    VARCHAR,
  logo_url     VARCHAR,
  ciudad       VARCHAR,
  verificada   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============ CURRICULUM ============
CREATE TABLE curriculum (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirante_id UUID NOT NULL REFERENCES aspirante(id) ON DELETE CASCADE,
  titulo       VARCHAR NOT NULL,
  resumen      TEXT,
  educacion    JSONB DEFAULT '[]',
  experiencia  JSONB DEFAULT '[]',
  proyectos    JSONB DEFAULT '[]',
  habilidades  TEXT[],
  idiomas      JSONB DEFAULT '[]',
  cv_pdf_url   VARCHAR,
  es_principal BOOLEAN DEFAULT false,
  visible      BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============ OFERTA (única tabla) ============
CREATE TABLE oferta (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_tipo      autor_tipo NOT NULL,
  autor_id        UUID NOT NULL,
  tipo_oferta     tipo_oferta NOT NULL,
  titulo          VARCHAR NOT NULL,
  descripcion     TEXT NOT NULL,
  requisitos      TEXT,
  habilidades_req TEXT[],
  modalidad       VARCHAR,
  ubicacion       VARCHAR,
  salario_min     NUMERIC(10,2),
  salario_max     NUMERIC(10,2),
  tipo_contrato   VARCHAR,
  objetivo        VARCHAR,
  grupo_id        UUID,
  fecha_limite    TIMESTAMPTZ,
  cupos           SMALLINT DEFAULT 1,
  estado          estado_oferta NOT NULL DEFAULT 'publicada',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT oferta_autor_tipo_coherente CHECK (
    (autor_tipo = 'empresa'   AND tipo_oferta IN ('normal','dash')) OR
    (autor_tipo = 'aspirante' AND tipo_oferta = 'feat')
  )
);

CREATE INDEX idx_oferta_feed ON oferta (estado, tipo_oferta, fecha_limite DESC);
CREATE INDEX idx_oferta_autor ON oferta (autor_tipo, autor_id);

-- ============ EVALUACION CURRICULUM ============
CREATE TABLE evaluacion_curriculum (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id            UUID NOT NULL REFERENCES oferta(id) ON DELETE CASCADE,
  curriculum_id        UUID NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
  aspirante_id         UUID NOT NULL REFERENCES aspirante(id) ON DELETE CASCADE,
  grupo_id             UUID,
  estado               estado_evaluacion NOT NULL DEFAULT 'postulado',
  comentario_empresa   TEXT,
  puntuacion           SMALLINT CHECK (puntuacion BETWEEN 1 AND 5),
  fecha_postulacion    TIMESTAMPTZ DEFAULT now(),
  fecha_evaluacion     TIMESTAMPTZ,
  evaluado_por_empresa BOOLEAN DEFAULT false,
  UNIQUE (oferta_id, curriculum_id)
);

CREATE INDEX idx_eval_oferta_estado ON evaluacion_curriculum (oferta_id, estado);
CREATE INDEX idx_eval_aspirante ON evaluacion_curriculum (aspirante_id);

-- ============ GRUPOS ============
CREATE TABLE grupo (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       VARCHAR NOT NULL,
  descripcion  TEXT,
  lider_id     UUID NOT NULL REFERENCES aspirante(id),
  max_miembros SMALLINT DEFAULT 4,
  estado       estado_grupo NOT NULL DEFAULT 'formando',
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE oferta
  ADD CONSTRAINT fk_oferta_grupo
  FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE SET NULL;

ALTER TABLE evaluacion_curriculum
  ADD CONSTRAINT fk_eval_grupo
  FOREIGN KEY (grupo_id) REFERENCES grupo(id) ON DELETE SET NULL;

CREATE TABLE grupo_miembro (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id      UUID NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
  aspirante_id  UUID NOT NULL REFERENCES aspirante(id) ON DELETE CASCADE,
  rol_en_grupo  VARCHAR,
  curriculum_id UUID REFERENCES curriculum(id),
  estado        estado_miembro NOT NULL DEFAULT 'invitado',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (grupo_id, aspirante_id)
);

-- ============ VALORACIONES ============
CREATE TABLE valoracion_oferta (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirante_id UUID NOT NULL REFERENCES aspirante(id) ON DELETE CASCADE,
  oferta_id    UUID NOT NULL REFERENCES oferta(id) ON DELETE CASCADE,
  reaccion     reaccion NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (aspirante_id, oferta_id)
);

CREATE TABLE valoracion_curriculum (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
  reaccion      reaccion NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (empresa_id, curriculum_id)
);

CREATE TABLE valoracion_curriculum_aspirante (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aspirante_id  UUID NOT NULL REFERENCES aspirante(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
  reaccion      reaccion NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (aspirante_id, curriculum_id)
);

CREATE INDEX idx_val_cv_asp_curriculum ON valoracion_curriculum_aspirante (curriculum_id);