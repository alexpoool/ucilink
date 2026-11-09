# Arquitectura — visión técnica global

Backend y webapp siguen **Clean Architecture por features** (vertical slice).
Cada feature agrupa `domain` → `application` → `infrastructure`.

## Dirección de dependencias (obligatoria)

```
infrastructure ──▶ application ──▶ domain      (nunca al revés)
```

- `domain`: entidade puras, VOs, puertos (interfaces) de repositorios, excepciones. Sin ORM, sin Express, sin React.
- `application`: DTOs (zod), use-cases (`execute()` único por archivo), mappers.
- `infrastructure`: controllers (una pieza cada uno), repos `.repository.impl.ts` con `pg`/HTTP, routes, `.module.ts` (wiring DI).

## Backend (Express + pg, TypeScript strict)

| Pieza | Dónde vive | Regla |
|---|---|---|
| Secretos | `src/config/secrets.ts` | única fuente de env vars (valida con zod al boot) |
| DB | `src/config/db.ts` | pool `pg`; repos reciben `Database` inyectado |
| Logs | `src/config/logs.ts` | pino; único punto de emisión |
| CORS | `src/config/cors.ts` | configurado en `app.ts` |
| Migraciones | `migrations/*.ts` + `runner.ts` | `<timestamp>_<desc>.ts` con `up()`/`down()` reversibles; tabla de registro `_migraciones` |
| Tests | `tests/` | espejo 1:1; gemelos para archivos **con lógica** (use-cases, `.repository.impl.ts`, servicios). DTOs e interfaces NO |
| Middlewares | `shared/infrastructure/middlewares/` | `auth.middleware.ts` (requireAuth + requireRol), `error.middleware.ts` (HttpException → HTTP; zod → 400) |

Errores: toda excepción de dominio extiende `HttpException` (`shared/domain/http.exception.ts`)
con su código HTTP. Nunca `Error` genérico desde las capas internas.

## Frontend (Next.js 15 App Router)

- `app/` **solo enruta**: re-exporta páginas de features y expone metadata.
- `features/<x>/domain/` plano con sufijos `.types.ts/.schema.ts/.helpers.ts/.constants.ts`; prohibido React/Next/fetch.
- `shared/infrastructure/components/ui` primitivas con **tokens semánticos** (`bg-background`, `text-foreground`...), `darkMode: 'class'` en Tailwind, ThemeProvider propio en Context.
- Data fetching: Server Components por defecto; TanStack Query solo en client components que lo necesitan (p.ej. polling de notificaciones 30s).

## Cross-feature (puertos compartidos)

Regla del AGENT: tipo usado por 2+ features → `shared/`. Hoy:
- `creador-notificaciones.port.ts` (shared/domain): el use-case **postular.oferta**
  (evaluacion) inserta la evaluación y en el mismo桐 use-case crea la notificación
  para la empresa; la implementación vive en `notificacion` feature.

## Convenciones

- Archivos kebab-case con sufijo de capas `.use-case.ts`, `.controller.ts`, `.types.ts`...
- Sin `index.ts` de barrel exports.
- Un caso de uso por archivo con clase PascalCase + `execute()`.
- UI frontend: nada de colores fijos (`bg-white`); solo tokens semánticos.
- Responsive mobile-first: bien en 360/768/1280+; tablas → cards en móvil.
